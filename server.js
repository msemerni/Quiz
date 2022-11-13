const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
require('dotenv').config();
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
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

//// validate user-JOI
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
    .string()
    .required()
    .pattern(new RegExp(PASSWORD_PATTERN)),

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

const Question = mongoose.model("Question", questionSchema);
const User = mongoose.model("User", userSchema);

db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => console.log("Mongo connected"));

let redisClient = createClient({
  legacyMode: true,
  url: `${REDIS_NAME}://${REDIS_HOST}:${REDIS_PORT}`
});

redisClient.connect().then(console.log("Redis connected"));

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    resave: false,
    rolling: true, 
    saveUninitialized: false,
    secret: SESSION_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    }
  }));

app.use(function (req, res, next) {
  if (!req.session) {
    return next(new Error("oh no"));
  }
  next();
})

redisClient.on("error", console.error.bind(console, "Error connection to Redis:"));

app.use(bodyParser.json());

app.use(express.static("public"));

// create new user
app.post("/user/signup", async (req, res) => {
  try {
    const { login, password, confirmPassword, nick } = req.body;
    const isNotValidNewUser = joiSchema.validate({ login, password, confirmPassword, nick }).error;

    if (password !== confirmPassword) {
      return res.status(401).send({ status: "error", message: "confirm password doesn`t match" });
    }

    if (!isNotValidNewUser) {
      const isUserExist = await User.findOne({ login });

      if (isUserExist) {
        return res.status(401).send({ status: "error", message: "user already exist" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = new User({ login, password: passwordHash, nick: nick || "anon" });
      await newUser.save();
      req.session.user = newUser;
      res.status(201).send({ login: newUser.login, nick: newUser.nick });
    }
    else {
      res.status(401).send(isNotValidNewUser.details[0]);
    }
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
});

// login
app.post("/user/login", async (req, res) => {
  try {
    const { login, password } = req.body;
    const user = await User.findOne({ login });

    if (user) {
      const isCorrectPassword = await bcrypt.compare(password, user.password);

      if (isCorrectPassword) {
        req.session.user = user;
        return res.status(200).send({ _id: user._id, login: user.login, nick: user.nick });
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

// logout
app.get("/user/logout", async (req, res) => {
  try {
    req.session.destroy();
    res.status(200).json({ status: "success", message: "logout success" });
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
});

// read all questions
app.get("/question", protectAccess, async (req, res) => {
  try {
    res.send(await Question.find());
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
});

// read question by ID
app.get("/question/:id", protectAccess, async (req, res) => {
  try {
    res.send(await Question.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }));
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
});

// create new question
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

// delete question
app.delete("/question/:id", protectAccess, async (req, res) => {
  try {
    res.send(await Question.findByIdAndDelete({ _id: mongoose.Types.ObjectId(req.params.id) }));
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
});

// update question:
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

app.listen(port, () => console.log(`${APP_NAME} app listening on port ${port}`));
