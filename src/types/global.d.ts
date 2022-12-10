
import "express-session";
import { Request } from "express"
import { IUser } from "../types/project-types";

declare module 'express-session' {
  export interface Session {
    user: IUser;
  }
}

export interface IGetUserAuthInfoRequest extends Request {
  user: IUser;
}
