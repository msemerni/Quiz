import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from "mongodb";
import { createClient } from "redis";
import * as GameService from "./game-service";
import RedisService from "./game-redis-service";
import * as SQSService from "../../sqs/sqs-send-msg-service";
import { IUserQuestion, IDBQuestion, IGameStatistics } from "../../types/project-types";
require('dotenv').config();

const { HOST } = process.env;

const CreateQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const gameUUID: string = uuidv4();
    const gameName: string = req.params.gamename;
    const initiatorUserID: ObjectId = req.session.user._id as unknown as ObjectId;
    const opponentUserID: ObjectId = req.params.userid as unknown as ObjectId;
    const redisClient: ReturnType<typeof createClient> = req.app.get("redisClient");
    const gameLink: string = `${HOST}/?gameuuid=${gameUUID}`;

    await GameService.generateGameObject(gameUUID, gameName, initiatorUserID, opponentUserID, redisClient);

    res.status(200).send(gameLink);

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}

const SendQuestionToUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const gameUUID: string = req.params.gameuuid;
    const redisClient: ReturnType<typeof createClient> = req.app.get("redisClient");
    const userID: ObjectId = req.session.user._id as unknown as ObjectId;
    await RedisService.resetIsUsersAnsweredCurrentQuestion(gameUUID, redisClient);
    await RedisService.changeGameStatus(gameUUID, "process", redisClient);
    await RedisService.setCurrentQuestionSendTime(gameUUID, redisClient);
    const allQuestions: Array<IDBQuestion> | null = await RedisService.getAllQuestions(gameUUID, redisClient);
    const rawQuestion: IDBQuestion | null = await RedisService.getOneQuestion(gameUUID, redisClient);
    const gameStatistics: IGameStatistics | null = await RedisService.getGameStatistics(gameUUID, redisClient);

    if (!allQuestions) {
      throw new Error("Questions not found");
    }

    if (!rawQuestion) {
      await RedisService.changeGameStatus(gameUUID, "finished", redisClient);
      res.status(200).send({ gameStatistics });

      const isSendToSQS = await RedisService.checkIsSendToSQS(gameUUID, redisClient);

      if (!isSendToSQS) {

        // await SQSService.sendDataToAWSQueue(gameStatistics);
        
        await RedisService.setIsSendToSQS(gameUUID, redisClient);
      }

      return;
    }

    const question: IUserQuestion | null = GameService.hideCorrectAnswers(rawQuestion!);

    res.status(200).send({ question, gameStatistics });

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}


const SetAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const io: any = req.app.get("io");
    const redisClient: ReturnType<typeof createClient> = req.app.get("redisClient");
    const userID: ObjectId = req.session.user._id as unknown as ObjectId;
    const gameUUID: string = req.params.gameuuid;
    const questionID: string = req.params.questionid;
    const userAnswer: string = req.body.userAnswer;
    const correctAnswer: string | null = await GameService.createAnswerReview(gameUUID, questionID, userID, userAnswer, redisClient);

    io.to(gameUUID).emit('user answered', userID);

    res.status(200).send({ correctAnswer });

    const isAllUsersAnswered = await GameService.checkIsAllUsersAnswered(gameUUID, redisClient);

    if (isAllUsersAnswered) {
      await RedisService.incrementCurrentQuestionNumber(gameUUID, redisClient);

      io.to(gameUUID).emit('next question', gameUUID);
    };

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}

export {
  CreateQuiz,
  SendQuestionToUser,
  SetAnswer
};
