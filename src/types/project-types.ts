import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export interface IUser extends Document {
    _id: ObjectId,
    login: string,
    password: string,
    nick?: string,
}

export interface IDBUser extends Document {
    _id: ObjectId,
    login: string,
    nick?: string,
}

export interface IQuestion extends Document {
    title: string,
    answers: IAnswer
}

export interface IUserQuestion {
    _id: string,
    title: string,
    answers: Array<String>
}

export interface IDBQuestion {
    _id: string,
    title: string,
    answers: Array<IAnswer>
}

export interface IAnswer {
    [key: string]: Boolean
}

export interface IAnswerReview {
    _id: string,
    title: string,
    userAnswer: string
    correctAnswer: string
    isCorrectAnswer: boolean
}

export interface IGameLinkObject {
    gameUUID: string,
    gameName: string,
    initiatorUser: IDBUser,
    opponentUser: IDBUser,
    linkCreationTime: number
}
