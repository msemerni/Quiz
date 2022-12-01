import { Request, Response } from 'express';
const app = require("../server.js");
const protectAccess = require("./middleware/auth.js");
const { ShowQuestions, ShowQuestionById, CreateNewQuestion, UpdateQuestion, DeleteQuestion } = require("./question-service.js");
const Question = require("./question-model");


// show all questions
app.get("/question", protectAccess, async (req, res) => {
  // console.log(res);
  ShowQuestions(res);
  try {
    res.send(await Question.find());
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
});

// show question by ID
app.get("/question/:id", protectAccess, async (req, res) => {
  ShowQuestionById(req, res);
});

// create new question
app.post("/question", protectAccess, async (req, res) => {
  CreateNewQuestion(req, res);
});

// update question:
app.put("/question/:id", protectAccess, async (req, res) => {
  UpdateQuestion(req, res);
});

// delete question
app.delete("/question/:id", protectAccess, async (req, res) => {
  DeleteQuestion(req, res);
});
