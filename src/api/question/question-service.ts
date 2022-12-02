import { Request, Response } from 'express';
const Question = require("./user/question-model");
const mongoose = require("mongoose");


// type QuestionType = {
//     .......
//   }

const ShowQuestions = async (res: Response) => {
  try {
    res.send(await Question.find());
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
}

const ShowQuestionById = async (req: Request, res: Response) => {
  try {
    res.send(await Question.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }));
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
}

const CreateNewQuestion = async (req: Request, res: Response) => {
  try {
    const newQuestion = new Question(req.body);
    await newQuestion.save();
    res.status(201).send(newQuestion);
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
}

const UpdateQuestion = async (req: Request, res: Response) => {
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
}

const DeleteQuestion = async (req: Request, res: Response) => {
  try {
    res.send(await Question.findByIdAndDelete({ _id: mongoose.Types.ObjectId(req.params.id) }));
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
}

module.exports = {
  ShowQuestions,
  ShowQuestionById,
  CreateNewQuestion,
  UpdateQuestion,
  DeleteQuestion
};
