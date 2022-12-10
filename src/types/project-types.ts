import { Document } from "mongoose";

export interface IUser extends Document {
    login: string,
    password: string,
    nick?: string,
}

type Answer = {
    answers: { [key: string]: string };
}

export interface IQuestion extends Document {
    title: string,
    answers: Answer;
}
