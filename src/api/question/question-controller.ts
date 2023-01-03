import { Request, Response } from "express";
import QuestionService from "./question-service";
import RedisService from "./question-redis-service";
import { IDBQuestion, IQuestion, IUserQuestion, IAnswerReview } from "../../types/project-types";
import { createClient } from "redis";


const GetAllQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const allQuestions: Array<IDBQuestion> | null = await QuestionService.getAllQuestions();
    res.status(200).send(allQuestions);

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}


const StartQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const redisClient: ReturnType<typeof createClient> = req.app.get("redisClient");
    await QuestionService.startQuiz(redisClient);
    const currentQuestionNumber: string | null = await RedisService.getCurrentQuestionNumber(redisClient);
    const correctAnswerCount: string | null = await RedisService.getCorrectAnswerCount(redisClient);
    const dbFirstQuestion: IDBQuestion | null = await RedisService.getOneQuestion(redisClient);

    if (!dbFirstQuestion || !currentQuestionNumber || !correctAnswerCount) {
      throw new Error("Questions/quiz state not found");
    }

    const question: IUserQuestion = QuestionService.hideCorrectAnswers(dbFirstQuestion);

    res.status(200).send({ question, currentQuestionNumber, correctAnswerCount });

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}


const SendQuestionToUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const redisClient: ReturnType<typeof createClient> = req.app.get("redisClient");
    const allQuestions: Array<IDBQuestion> | null = await RedisService.getAllQuestions(redisClient);
    const rawQuestion: IDBQuestion | null = await RedisService.getOneQuestion(redisClient);
    const currentQuestionNumber: string | null = await RedisService.getCurrentQuestionNumber(redisClient);
    const correctAnswerCount: string | null = await RedisService.getCorrectAnswerCount(redisClient);

    if (!allQuestions) {
      throw new Error("Questions not found");
    }

    if (!rawQuestion) {
      const totalQuestions: string = allQuestions.length.toString();
      res.status(200).send({ totalQuestions, correctAnswerCount });
      return;
    }

    const question: IUserQuestion | null = QuestionService.hideCorrectAnswers(rawQuestion!);

    res.status(200).send({ question, currentQuestionNumber, correctAnswerCount });

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}


const GetAnswerReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const redisClient: ReturnType<typeof createClient> = req.app.get("redisClient");
    const questionID: string = req.params.id;
    const userAnswer: string = req.body.userAnswer;
    const answerReview: IAnswerReview | null = await QuestionService.createAnswerReview(questionID, userAnswer, redisClient);

    res.status(200).send(answerReview);

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
  StartQuiz,
  SendQuestionToUser,
  GetAnswerReview
};
