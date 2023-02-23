import { createClient } from "redis";
import { ObjectId } from "mongodb";
import { Question } from "../question/question-model";
import RedisService from "./game-redis-service";
import UserService from "../user/user-service";
import { IUserQuestion, IDBQuestion, IAnswer, IDBUser, IGameLinkObject, GameStatus } from "../../types/project-types";
require('dotenv').config();

const { QUIZ_QUESTION_QUANTITY } = process.env;

const generateGameObject = async (gameUUID: string, gameName: string, initiatorUserID: ObjectId, opponentUserID: ObjectId, redisClient: ReturnType<typeof createClient>): Promise<IGameLinkObject> => {
  const initiatorUser: IDBUser | null = await UserService.getUserById(initiatorUserID);
  const opponentUser: IDBUser | null = await UserService.getUserById(opponentUserID);
  const quizQuestions: Array<IDBQuestion> | null = await getRandomQuizQuestions(+QUIZ_QUESTION_QUANTITY!);

  if (!initiatorUser || !opponentUser || !quizQuestions) {
    throw new Error("users/questions not found in the DB");
  }

  const linkCreationTime: number = Date.now();

  const gameOptionsObject: IGameLinkObject = {
    gameUUID,
    gameName,
    users: [
      {
        user: initiatorUser,
        correctAnswers: 0,
        totalResponseTime: 0,
        isAnsweredCurrentQuestion: false
      },
      {
        user: opponentUser,
        correctAnswers: 0,
        totalResponseTime: 0,
        isAnsweredCurrentQuestion: false
      },
    ],
    linkCreationTime,
    quizQuestions,
    currentQuestionNumber: 0,
    currentQuestionSendTime: 0,
    gameStatus: GameStatus.created,
    isSendToSQS: false
  };
  await RedisService.setGameObject(gameOptionsObject, redisClient);

  return gameOptionsObject;
}

const getCorrectAnswer = (question: IDBQuestion): IAnswer => {
  const correctAnswer: IAnswer | undefined = question.answers.find(answer => Object.values(answer)[0] === true);
  if (!correctAnswer) {
    throw new Error("No correct answer in question");
  }
  return correctAnswer;
}

const isAnswerCorrect = (userAnswer: string, correctAnswer: IAnswer): boolean => {
  if (!correctAnswer) {
    throw new Error("No correct answer in question");
  }
  if (Object.keys(correctAnswer!)[0] === userAnswer) {
    return true;
  }
  return false;
}

const createAnswerReview = async (gameUUID: string, questionID: string, userID: ObjectId, userAnswer: string, redisClient: ReturnType<typeof createClient>): Promise<string> => {
  if (!userAnswer) {
    userAnswer = "";
  }
  const gameObject: IGameLinkObject | null = await RedisService.getGameObject(gameUUID, redisClient);

  if (!gameObject) {
    throw new Error("gameObject not found (createAnswerReview)")
  }

  const currentQuestionNumber: number = gameObject.currentQuestionNumber;
  const currentQuestion: IDBQuestion = gameObject.quizQuestions[currentQuestionNumber];
  const correctAnswerDB: IAnswer = getCorrectAnswer(currentQuestion);
  const correctAnswer: string = Object.keys(correctAnswerDB)[0];
  const title: string = currentQuestion.title;
  const isCorrectAnswer: boolean = isAnswerCorrect(userAnswer, correctAnswerDB);

  for (const userObject of gameObject.users) {
    if (userObject.user._id === userID && currentQuestion._id === questionID && userObject.isAnsweredCurrentQuestion === false) {
      userObject.isAnsweredCurrentQuestion = true;
      const questionResponseTime: number = Date.now() - gameObject.currentQuestionSendTime;
      userObject.totalResponseTime += questionResponseTime;

      if (isCorrectAnswer) {
        userObject.correctAnswers++;
      }

      await RedisService.updateGameObject(gameObject, redisClient);
    }
  }

  return correctAnswer;
}

const checkIsAllUsersAnswered = async (gameUUID: string, redisClient: ReturnType<typeof createClient>): Promise<boolean> => {
  const gameObject: IGameLinkObject | null = await RedisService.getGameObject(gameUUID, redisClient);

  let isAllUsersAnswered = true;

  for (const userObject of gameObject.users) {
    if (userObject.isAnsweredCurrentQuestion === false) {
      isAllUsersAnswered = false;
    }
  }

  return isAllUsersAnswered;
}

const getRandomQuizQuestions = async (questionQuantity: number): Promise<Array<IDBQuestion> | null> => {
  if (!questionQuantity) {
    questionQuantity = 2;
  }

  const questions: Array<IDBQuestion> | null = await Question.aggregate(
    [{ $sample: { size: questionQuantity } }]
  )
  return questions;
}

const hideCorrectAnswers = (rawQuestion: IDBQuestion): IUserQuestion => {
  const answersArray: Array<String> = [];
  const { _id, title, answers }: { _id: string, title: string, answers: Array<IAnswer> } = rawQuestion;

  for (let i: number = 0; i < answers.length; i++) {
    const element = Object.keys(answers[i]);
    answersArray.push(element[0]);
  }

  const transformedQuestion: IUserQuestion = {
    _id: _id,
    title: title,
    answers: answersArray,
  }
  return transformedQuestion;
}

export {
  generateGameObject,
  getRandomQuizQuestions,
  hideCorrectAnswers,
  createAnswerReview,
  checkIsAllUsersAnswered,
};
