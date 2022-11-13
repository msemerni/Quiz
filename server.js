const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const reload = require('reload');
require('dotenv').config();
const session = require("express-session");
let RedisStore = require("connect-redis")(session);
const { createClient } = require("redis");
const protectAccess = require("./middleware/auth.js");
const Joi = require('joi');

const {
  APP_NAME,
  PORT,
  DB_CONNECTION,
  DB_HOST,
  DB_PORT,
  DB_DATABASE,
  REDIS_NAME,
  REDIS_HOST,
  REDIS_PORT,
  SESSION_SECRET,
  PASSWORD_PATTERN
} = process.env;


//// JOI
const joiSchema = Joi.object({

  login: Joi
    .string()
    .required()
    .email(),

  password: Joi
    .string()
    .required()
    .pattern(new RegExp(PASSWORD_PATTERN)),

  confirmPassword: Joi
    .any()
    .required()
    .equal(Joi.ref('password')),

  nick: Joi
    .string()
    .empty('')
    .max(50)
    .default('anon')
})

const dbOptions = {
  useNewUrlParser: true,
};

const port = PORT || 3000;
const dbConnectionUrl = `${DB_CONNECTION}://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;
// const dbConnectionUrl = "mongodb://mongo:27017/contquizdb";


mongoose.connect(dbConnectionUrl, dbOptions);



const db = mongoose.connection;

const questionSchema = new mongoose.Schema(
  {
    title: String,
    answers: []
  },
  { versionKey: false }
);

const userSchema = new mongoose.Schema(
  {
    login: String,
    password: String,
    nick: String,
  },
  { versionKey: false }
);

// класс по схеме:
const Question = mongoose.model("Question", questionSchema);
const User = mongoose.model("User", userSchema);

db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => console.log("Mongo connected"));

//сессия
let redisClient = createClient({ 
  legacyMode: true,
  url: `${REDIS_NAME}://${REDIS_HOST}:${REDIS_PORT}`  //// УРЛ ДЛЯ КОНТЕЙНЕРА REDIS
});

redisClient.connect().then(console.log("Redis connected"));

app.use(
  session({
    store: new RedisStore({ client: redisClient }), // сохранять сессии в редис. по дефолту в памяти
    resave: false, // true-перезаписывать сессии если даже небыло изменений
    rolling: true, // обновляет maxAge
    saveUninitialized: false, // false-не будет помещать в redis пустые сессии (типа без такого: req.session.user = user;).
    secret: SESSION_SECRET, //подписание идентификатора сеанса
    cookie: {
      // secure: false, // false-сеансы будут создаваться и на http (true-только для https) ДЕФОЛТ
      maxAge: 1000 * 60 * 60 * 24 //1day
    }
  }));
 
// console.log("SESSION:",session);
app.use(function (req, res, next) {
  if (!req.session) {
    return next(new Error("oh no"));
  }
  next();
})

redisClient.on("error", console.error.bind(console, "Error connection to Redis:"));


// разобранный JSON в req.body
app.use(bodyParser.json());
// фронт
app.use(express.static("public"));

////////////////////////////////////
// создание нового юзера:
app.post("/user/signup", async (req, res) => {
  try {
    const { login, password, confirmPassword, nick } = req.body;

    const isNotValidNewUser =  joiSchema.validate({ login, password, confirmPassword, nick }).error;

    if (!isNotValidNewUser) {
      const isUserExist = await User.findOne({ login });

      if (!isUserExist) {
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({ login, password: passwordHash, nick: nick || "anon" });
        await newUser.save();
        req.session.user = newUser;
        res.status(201).send({ login: newUser.login, nick: newUser.nick });
      }
      else {
        res.status(401).send({ status: "error", message: "user already exist" });
      }
    }
    else {
      res.status(401).send(isNotValidNewUser.details[0]);
    }
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
});

// логин
app.post("/user/login", async (req, res) => {
  try {
    const { login, password } = req.body;
    const user = await User.findOne({ login });

    if (user) {
      const isCorrectPassword = await bcrypt.compare(password, user.password);
      console.log(isCorrectPassword);

      if (isCorrectPassword) {
        req.session.user = user;
        return res.status(200).send({_id: user._id, login: user.login, nick: user.nick || "Anon" });
      }

      res.status(401).send({ status: "error", message: "wrong password" });
    }
    else {
      res.status(401).send({ status: "error", message: "user not found" });
    }
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
});

// логаут
app.get("/user/logout", async (req, res) => {
  try {
    req.session.destroy();
    res.status(200).json({ status: "success", message: "logout success" });
  } 
  catch (error) {
    res.status(500).json({ "error": error });
  }
});

////////////////////////////////////
app.get("/question", protectAccess, async (req, res) => {
  try {
    res.send(await Question.find());
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
});

// отдает вопрос по id :
app.get("/question/:id", protectAccess, async (req, res) => {
  try {
    res.send(await Question.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }));
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
});

// создание нового вопроса:
app.post("/question", protectAccess, async (req, res) => {
  try {
    const newQuestion = new Question(req.body);
    await newQuestion.save();
    res.status(201).send(newQuestion);
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
});

// удаление вопроса:
app.delete("/question/:id", protectAccess, async (req, res) => {
  try {
    res.send(await Question.findByIdAndDelete({ _id: mongoose.Types.ObjectId(req.params.id) }));
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
});

// изменение вопроса:
app.put("/question/:id", protectAccess, async (req, res) => {
  try {
    const _id = req.params.id;
    const { title, answers } = req.body;
    const question = await Question.findOne({ _id });

    if (!question) {
      const newQuestion = new Question(req.body);
      await newQuestion.save();
      res.status(201).send(newQuestion);
    }
    else {
      if (title) {
        question.title = title;
      }
      if (answers) {
        question.answers = answers;
      }

      await question.save();
      res.status(200).send(question);
    }
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
});

// Перезагрузка фронта: /// ОШИБКА СОКЕТА В КОНСОЛИ // УДАЛИТЬ ЗАВИСИМОСТИ !!!!!
// reload(app).then(reloadReturned => {
//   app.listen(port, () => console.log(`${APP_NAME} app listening on port ${port}`));
// }).catch(err => {
//   console.error("Reload could not start", err)
// });

app.listen(port, () => console.log(`${APP_NAME} app listening on port ${port}`));
