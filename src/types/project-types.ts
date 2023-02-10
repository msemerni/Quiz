import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export enum GameStatus { 
  created="created", 
  process="process", 
  finished="finished"
};

export interface IUser extends Document {
  _id: ObjectId,
  login: string,
  password: string,
  nick?: string,
};

export interface IDBUser extends Document {
  _id: ObjectId,
  login: string,
  nick?: string,
};

export interface IQuestion extends Document {
  title: string,
  answers: IAnswer
};

export interface IUserQuestion {
  _id: string,
  title: string,
  answers: Array<String>
};

export interface IDBQuestion {
  _id: string,
  title: string,
  answers: Array<IAnswer>
};

export interface IAnswer {
  [key: string]: Boolean
};

export interface IAnswerReview {
  userID: ObjectId,
  // _id: string,
  title: string,
  userAnswer: string
  correctAnswer: string
  isCorrectAnswer: boolean
};

export interface IUserStatistics {
    user: IDBUser,
    correctAnswers: number,
    totalResponseTime: number,
    isAnsweredCurrentQuestion: boolean
};

export interface IGameStatistics {
  totalQuestionsCount: number,
  statistics: Array<IUserStatistics>
};

export interface IGameLinkObject {
  gameUUID: string,
  gameName: string,
  users: Array<IUserStatistics>,
  linkCreationTime: number,
  quizQuestions: Array<IDBQuestion>,
  currentQuestionNumber: number,
  currentQuestionSendTime: number,
  gameStatus: GameStatus
};
 
export interface IStatisticsArr {
  readonly id: string;
  readonly title: string;
  readonly userAnswer: string;
  readonly correctAnswer: string;
  readonly isCorrectAnswer: boolean;
};

export interface IStatistics {
  readonly user: IDBUser;
  readonly answers: IStatisticsArr;
};

export interface IGameLinkData {
  readonly gameLink: string;
  readonly initiatorUserLogin: string;
};

export interface IError {
  readonly status: string;
  readonly message: string;
};

