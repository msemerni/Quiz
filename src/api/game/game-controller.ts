import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import * as GameService from "./game-service";
import UserService from "../user/user-service";
import RedisService from "../question/question-redis-service";
import * as QuestionService from "../question/question-service";
import { IUser, IUserQuestion, IDBQuestion, IAnswerReview, IGameStatistics } from "../../types/project-types";
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
    const gameLink: string = `${URL}:${PORT}/?gameuuid=${gameUUID}`;

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

    await RedisService.changeGameStatus(gameUUID, "process", redisClient);
    await RedisService.resetIsUsersAnsweredCurrentQuestion(gameUUID, redisClient);

    
    const allQuestions: Array<IDBQuestion> | null = await RedisService.getAllQuestions(gameUUID, redisClient);
    const rawQuestion: IDBQuestion | null = await RedisService.getOneQuestion(gameUUID, redisClient);
    const gameStatistics: IGameStatistics | null = await RedisService.getGameStatistics(gameUUID, redisClient);
    
    // console.log("GAME_STATISTICS:", gameStatistics);

    // for (const user of gameObject.users) {
    //   if (Object.keys(user).includes(userIdStr) && user[userIdStr].isAnsweredCurrentQuestion === false) {
    //     user[userIdStr].isAnsweredCurrentQuestion = true;
    //     if (isCorrectAnswer) {
    //       user[userIdStr].correctAnswers++;
    //     }
    //   }
    // }
  
    // await RedisService.setGameObject(gameObject, redisClient);
    


    if (!allQuestions) {
      throw new Error("Questions not found");
    }

    if (!rawQuestion) {
      await RedisService.changeGameStatus(gameUUID, "finished", redisClient);
      res.status(200).send({ gameStatistics });


      // const answerReviewSQS: string | null = await RedisService.getAnswerReview(redisClient);
      // if (!answerReviewSQS) {
      //   throw new Error("Answer review not found");
      // }
      // SQSService.sendDataToAWSQueue(user, answerReviewSQS);
      return;
    }

    const question: IUserQuestion | null = GameService.hideCorrectAnswers(rawQuestion!);

    // console.log("SendQuestionToUser", { question, gameStatistics })

    res.status(200).send({ question, gameStatistics });

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}


const SetAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const redisClient: ReturnType<typeof createClient> = req.app.get("redisClient");
    const userID: ObjectId = req.session.user._id as unknown as ObjectId;
    // const questionID: string = req.params.questionid;
    const gameUUID: string = req.params.gameuuid;
    const userAnswer: string = req.body.userAnswer;
    const answerReview: IAnswerReview | null = await GameService.createAnswerReview(gameUUID, userID, userAnswer, redisClient);

    console.log("###_answerReview: ", answerReview);
    
    res.status(200).send("answerReview");

  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}

export { 
  // JoinGame, 
  CreateQuiz, 
  SendQuestionToUser,
  SetAnswer
};
