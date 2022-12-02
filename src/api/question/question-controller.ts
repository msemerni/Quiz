import { Request, Response } from 'express';
const app = require("../server.js");
const protectAccess = require("./middleware/auth.js");
const { ShowQuestions, ShowQuestionById, CreateNewQuestion, UpdateQuestion, DeleteQuestion } = require("./question-service.js");

// show all questions
app.get("/question", protectAccess, async (req: Request, res: Response) => {
  ShowQuestions(res);
});

// show question by ID
app.get("/question/:id", protectAccess, async (req: Request, res: Response) => {
  ShowQuestionById(req, res);
});

// create new question
app.post("/question", protectAccess, async (req: Request, res: Response) => {
  CreateNewQuestion(req, res);
});

// update question:
app.put("/question/:id", protectAccess, async (req: Request, res: Response) => {
  UpdateQuestion(req, res);
});

// delete question
app.delete("/question/:id", protectAccess, async (req: Request, res: Response) => {
  DeleteQuestion(req, res);
});
