const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const reload = require('reload');
require('dotenv').config();
// express-session

const options = {
  useNewUrlParser: true,
  // reconnectTries: Number.MAX_VALUE,
  // reconnectInterval: 500,
  // connectTimeoutMS: 10000,
};

const {
  APP_NAME,
  PORT,
  DB_CONNECTION,
  DB_HOST,
  DB_PORT,
  DB_DATABASE,
} = process.env;

const dbOptions = {
  useNewUrlParser: true,
};

const port = PORT || 3000;
const dbConnectionUrl = `${DB_CONNECTION}://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;

mongoose.connect(dbConnectionUrl, dbOptions);
// mongoose.connect("mongodb://mongo:27017/contquizdb",{ useNewUrlParser: true });

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
db.once("open", () => console.log("Database connected"));

// разобранный JSON в req.body
app.use(bodyParser.json());

app.use(express.static("public"));

////////////////////////////////////
// создание нового юзера:
app.post("/user/signup", async (req, res) => {
  try {
    const { login, password, nick } = req.body;
    const isUserExist = await User.findOne({ login });

    if (!isUserExist) {
      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = new User({ login, password: passwordHash, nick });
      // // const isCorrectPassword = await bcrypt.compare(password, passwordHash);
      await newUser.save();
      res.status(201).send({ login, nick });
    }
    else {
      res.status(409).json("User already exist");
    }
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
});

////////////////////////////////////

// отдает все вопросы
app.get("/question", async (req, res) => {
  try {
    res.send(await Question.find());
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
});

// отдает вопрос по id :
app.get("/question/:id", async (req, res) => {
  try {
    res.send(await Question.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }));
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
});

// создание нового вопроса:
app.post("/question", async (req, res) => {
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
app.delete("/question/:id", async (req, res) => {
  try {
    res.send(await Question.findByIdAndDelete({ _id: mongoose.Types.ObjectId(req.params.id) }));
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
});

// изменение вопроса:
app.put("/question/:id", async (req, res) => {
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
