import { Request, Response } from 'express';
const QuestionService = require('./question-service');

const ShowQuestions = async (req: Request, res: Response) => {
  try {
    const allQuestions = await QuestionService.getQuestions();
    res.status(200).send(allQuestions);

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}

const ShowQuestionById = async (req: Request, res: Response) => {
  try {
    const questionById = await QuestionService.getQuestionById(req.params.id)
    res.status(200).send(questionById);

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}

const UpsertQuestion = async (req: Request, res: Response) => {
  try {
    const question = await QuestionService.upsertQuestion(req.body);
    res.status(200).send(question);

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}

const DeleteQuestion = async (req: Request, res: Response) => {
  try {
    const deletedQuestion = await QuestionService.deleteQuestion(req.params.id)
    res.status(200).send(deletedQuestion);

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}

module.exports = { ShowQuestions, ShowQuestionById, UpsertQuestion, DeleteQuestion };
