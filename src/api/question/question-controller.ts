import { Request, Response } from "express";
import * as QuestionService from "./question-service";
import { IDBQuestion, IQuestion } from "../../types/project-types";

const GetAllQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const allQuestions: Array<IDBQuestion> | null = await QuestionService.getAllQuestions();
    res.status(200).send(allQuestions);

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}

const GetQuestionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const questionID: string = req.params.id;
    const questionById: IDBQuestion | null = await QuestionService.getQuestionById(questionID)
    res.status(200).send(questionById);

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}

const UpsertQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const question: IQuestion | null = await QuestionService.upsertQuestion(req.body);
    res.status(200).send(question);

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}

const DeleteQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedQuestion: IDBQuestion | null = await QuestionService.deleteQuestion(req.params.id)
    res.status(200).send(deletedQuestion);

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}

export {
  GetAllQuestions,
  GetQuestionById,
  UpsertQuestion,
  DeleteQuestion,
};