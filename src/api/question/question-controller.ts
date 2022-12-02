import { Request, Response } from 'express';
const Question = require("./question-model");
const QuestionService = require('./question-service');

const ShowQuestions = async (req: Request, res: Response) => {
  try {
    const allQuestions = await QuestionService.getQuestions();
    res.status(200).send(allQuestions);

  }catch (error) {
    res.status(500).json({ status: "error", message: "unsuccessful show questions" });
  }
};

const ShowQuestionById = async (req: Request, res: Response) => {
  try {
    res.send(await QuestionService.getQuestionById(req.params.id));

  }catch (error) {
    res.status(500).json({ status: "error", message: "unsuccessful show question by ID" });
  }
}

const CreateNewQuestion = async (req: Request, res: Response) => {
  try {
    res.status(201).send(await QuestionService.createQuestion(req.body));

  }catch (error) {
    res.status(500).json({ status: "error", message: "unsuccessful create question" });
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
    }else {
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
    res.status(500).json({ status: "error", message: "unsuccessful update question" });
  }
}

const DeleteQuestion = async (req: Request, res: Response) => {
  try {
    res.status(200).send(await QuestionService.deleteQuestion(req.params.id));

  }catch (error) {
    /////// КАК ОТПРАВИТЬ ОШИБКУ? .json({ error })
    res.status(500).json({ status: "error", message: "unsuccessful delete question" });
  }

}
module.exports = {
  ShowQuestions,
  ShowQuestionById,
  CreateNewQuestion,
  UpdateQuestion,
  DeleteQuestion
};
