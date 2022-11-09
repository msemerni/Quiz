const mongoose = require("mongoose");
const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
const bodyParser = require("body-parser");

// база данных "quizdb" или "contquizdb"
mongoose
  // .connect("mongodb://mongo:27017/contquizdb",{ useNewUrlParser: true })
  .connect("mongodb://127.0.0.1:27017/quizdb", { useNewUrlParser: true });
const db = mongoose.connection;

const questionSchema = new mongoose.Schema(
  {
    title: String,
    answers: []
  },
  { versionKey: false }
);

// класс по схеме:
const Question = mongoose.model("Question", questionSchema);

db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => console.log("Database connected"));

// разобранный JSON в req.body
app.use(bodyParser.json());

app.use(express.static("public"));

// отдает все вопросы
app.get("/questions", async (req, res) => {
  try {
    res.send(await Question.find());
  }
  catch (error) {
    return res.status(500).json({ "error": error });
  }
});

// отдает вопрос по id :
app.get("/questions/:id", async (req, res) => {
  try {
    res.send(await Question.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }));
  }
  catch (error) {
    return res.status(500).json({ "error": error });
  }
});

// создание нового вопроса:
app.post("/questions", async (req, res) => {
  try {
    const newQuestion = new Question(req.body);
    await newQuestion.save();
    res.status(201).send(newQuestion);
  }
  catch (error) {
    return res.status(500).json({ "error": error });
  }
});

// удаление вопроса:
app.delete("/questions/:id", async (req, res) => {
  try {
    res.send(await Question.findByIdAndDelete({ _id: mongoose.Types.ObjectId(req.params.id) }));
  }
  catch (error) {
    return res.status(500).json({ "error": error });
  }
});

// изменение вопроса:
app.put("/questions/:id", async (req, res) => {
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
    return res.status(500).json({ "error": error });
  }
})

app.listen(port, () => console.log(`Quiz app listening on port ${port}`));
