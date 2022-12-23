import { Document } from "mongoose";

export interface IUser extends Document {
    login: string,
    password: string,
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
