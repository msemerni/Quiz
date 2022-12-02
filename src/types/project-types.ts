import { Document } from "mongoose";

export interface IUser extends Document {
    login: String,
    password: String,
    nick: String,
}

export interface IQuestion extends Document {
    title: String,
    answers: []
}





// type UserType = {
    
//     save(): UserType
//     // [key: string]: string
//   }
