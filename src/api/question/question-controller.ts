import { Request, Response } from "express";
import QuestionService from "./question-service";
import { IQuestion } from "../../types/project-types";

const GetAllQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const allQuestions: Array<IQuestion> | null = await QuestionService.getQuestions();
    res.status(200).send(allQuestions);

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}

const GetQuestionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const questionById: IQuestion | null = await QuestionService.getQuestionById(req.params.id)
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
    const deletedQuestion: IQuestion | null = await QuestionService.deleteQuestion(req.params.id)
    res.status(200).send(deletedQuestion);

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}

export { GetAllQuestions, GetQuestionById, UpsertQuestion, DeleteQuestion };
