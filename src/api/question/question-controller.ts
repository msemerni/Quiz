import { Request, Response } from "express";
import QuestionService from "./question-service";
import { IDBQuestion, IQuestion, IUserQuestion } from "../../types/project-types";


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
    await QuestionService.saveQuizQuestionsToRedis();
    const dbFirstQuestion: IDBQuestion | null = await QuestionService.getOneQuestionFromRedis(0);
    
    if (!dbFirstQuestion) {
      return;
    }
    
    const firstQuestion: IUserQuestion = QuestionService.transformQuestion(dbFirstQuestion);

    res.status(200).send(firstQuestion);

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}


const SendQuestionToUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const questionNumber: number = +req.params.questionNumber;
    const rawQuestion: IDBQuestion | null = await QuestionService.getOneQuestionFromRedis(questionNumber);

    if (!rawQuestion) {
      res.status(200).send({ "quiz status": "finish" });
      return;
    }

    const userQuestion: IUserQuestion | null = QuestionService.transformQuestion(rawQuestion);

    res.status(200).send(userQuestion);

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}


const CheckAnswerResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const questionID: string = req.params.id;
    const userAnswer: string = req.body.userAnswer;
    const answerReview = await QuestionService.checkAnswerResult(questionID, userAnswer);

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
  CheckAnswerResult
};
