import { Document } from "mongoose";

export interface IUser extends Document {
    login: String,
    password: String,
    nick: String,
}

// type UserType = {
    
//     save(): UserType
//     // [key: string]: string
//   }
