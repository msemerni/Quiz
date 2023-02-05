import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import * as GameService from "./game-service";
import UserService from "../user/user-service";
import RedisService from "../question/question-redis-service";
import * as QuestionService from "../question/question-service";
import { IUser, IGameLinkObject, IUserQuestion, IDBQuestion, IAnswerReview } from "../../types/project-types";
import { ObjectId } from "mongodb";
import { createClient } from "redis";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
require('dotenv').config();

const { URL, PORT } = process.env;
 
const CreateQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const gameUUID: string = uuidv4();
    const gameName: string = req.params.gamename;
    const initiatorUserID: ObjectId = req.session.user._id as unknown as ObjectId;
    const initiatorUserLogin: string = req.session.user.login;
    const opponentUserID: ObjectId = req.params.userid as unknown as ObjectId;
    const redisClient: ReturnType<typeof createClient> = req.app.get("redisClient");
    const gameLink: string = `${URL}:${PORT}/game/${gameUUID}`;

    await GameService.generateGameObject(gameUUID, gameName, initiatorUserID, opponentUserID, redisClient);

    res.status(200).send({initiatorUserLogin, gameLink});

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}

const JoinGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionUser: IUser = req.session.user;
    const gameUUID: string = req.params.gameuuid;
    const io: any = req.app.get("io");
    const redisClient: ReturnType<typeof createClient> = req.app.get("redisClient");
    const gameObject: IGameLinkObject = await RedisService.getGameObject(gameUUID, redisClient);
    const gameName: string = gameObject.gameName;

    // console.log(io.sockets.connected);
    // const rooms = io.sockets.adapter.rooms;
    // console.log(rooms);
    // socket.join(gameUUID);

    io.to(gameUUID).emit('user connected', sessionUser.login, gameName, gameUUID);

    res.redirect(`${URL}:${PORT}/${gameName}/${gameUUID}`);

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}

const SendQuestionToUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const gameUUID: string = req.params.gameuuid;
    const redisClient: ReturnType<typeof createClient> = req.app.get("redisClient");

    await RedisService.changeGameStatus(gameUUID, "process", redisClient);
    
    const allQuestions: Array<IDBQuestion> | null = await RedisService.getAllQuestions(gameUUID, redisClient);
    const rawQuestion: IDBQuestion | null = await RedisService.getOneQuestion(gameUUID, redisClient);
    const gameStatistics = await RedisService.getGameStatistics(gameUUID, redisClient);
    
    ////////// const currentQuestionNumber: string | null = await RedisService.getCurrentQuestionNumber(redisClient);
    // const correctAnswerCount: string | null = await RedisService.getCorrectAnswerCount(redisClient);
    // const  { _id, login, nick } = req.session.user;
    // const user: IDBUser = {_id, login, nick} as IDBUser;
    
    if (!allQuestions) {
      throw new Error("Questions not found");
    }

    if (!rawQuestion) {
      // const totalQuestionsCount: string = allQuestions.length.toString();
      await RedisService.changeGameStatus(gameUUID, "finished", redisClient);
      // const gameStatistics = await RedisService.getGameStatistics(gameUUID, redisClient);
      res.status(200).send({ gameStatistics });


      const answerReviewSQS: string | null = await RedisService.getAnswerReview(redisClient);
      if (!answerReviewSQS) {
        throw new Error("Answer review not found");
      }
      // SQSService.sendDataToAWSQueue(user, answerReviewSQS);
      return;
    }

    const question: IUserQuestion | null = GameService.hideCorrectAnswers(rawQuestion!);

    res.status(200).send({ question, gameStatistics });

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}

const GetAnswerReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const redisClient: ReturnType<typeof createClient> = req.app.get("redisClient");
    const questionID: string = req.params.questionid;
    const userAnswer: string = req.body.userAnswer;
    const answerReview: IAnswerReview | null = await GameService.createAnswerReview(questionID, userAnswer, redisClient);

    res.status(200).send(answerReview);

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}

export { 
  JoinGame, 
  CreateQuiz, 
  SendQuestionToUser,
  GetAnswerReview
};
