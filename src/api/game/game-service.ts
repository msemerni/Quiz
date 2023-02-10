import { Question } from "../question/question-model";
import { createClient } from "redis";
import { ObjectId } from "mongodb";
import RedisService from "../question/question-redis-service";
import * as QuestionService from "../question/question-service";
import UserService from "../user/user-service";
import { IUserQuestion, IDBQuestion, IAnswer, IAnswerReview, IDBUser, IGameLinkObject, GameStatus } from "../../types/project-types";

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
    gameStatus: GameStatus.created
  };
  // console.log("GAME_Options_Object:", gameOptionsObject);
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

  // console.log("&&_USER_ID: ", userIdStr);
  // console.log("&&_USER_ANSWER: ", userAnswer);
  // console.log("&&_GAME_OBJECT: ", gameObject);

  if (!gameObject) {
    throw new Error("gameObject not found (createAnswerReview)")
  }

  const currentQuestionNumber: number = gameObject.currentQuestionNumber; // 0
  const currentQuestion: IDBQuestion = gameObject.quizQuestions[currentQuestionNumber]; // {_id: '6395a34364974974d7646072', title: '7 + 7', answers: [Array]}
  const correctAnswerDB: IAnswer = getCorrectAnswer(currentQuestion);  // {"12": true}
  const correctAnswer: string = Object.keys(correctAnswerDB)[0]; // 12
  const title: string = currentQuestion.title; // "7+7"
  const isCorrectAnswer: boolean = isAnswerCorrect(userAnswer, correctAnswerDB); // true


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
  // createQuiz,
  createAnswerReview,
  checkIsAllUsersAnswered,
};



// const ob = {
//   gameUUID: '93b2dc5e-6ae6-42bd-92ff-a9d8119a2a45',
//   gameName: 'quiz',
//   initiator: {
//     user: {
//       _id: new ObjectId("63b5aa31badaa6eeb8d2488f"),
//       login: 'Alice',
//       nick: 'anon'
//     },
//     correctAnswers: 0,
//     totalResponseTime: 0
//   },
//   opponent: {
//     user: {
//       _id: new ObjectId("63b5aa46badaa6eeb8d24897"),
//       login: 'Misha',
//       nick: 'anon'
//     },
//     correctAnswers: 0,
//     totalResponseTime: 0
//   },
//   linkCreationTime: 1675368305661,
//   quizQuestions: [
//     {
//       _id: new ObjectId("6395a34364974974d7646072"),
//       title: '7 + 7',
//       answers: [Array]
//     },
//     {
//       _id: new ObjectId("6395a32264974974d764606e"),
//       title: '6 + 6',
//       answers: [Array]
//     },
//     {
//       _id: new ObjectId("63717c080dd834146741abb1"),
//       title: '3 + 3',
//       answers: [Array]
//     }
//   ],
//   currentQuestionNumber: 0,
//   gameStatus: 'created'
// }
