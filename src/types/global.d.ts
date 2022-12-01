
import "express-session";


declare module 'express-session' {
  export interface Session {
    user: { [key: string]: string };
  }
}



// declare namespace Express {
//   export interface Request {
//     user: { [key: string]: string };
//   }
//   export interface Response {
//     user: { [key: string]: string };
//   }
// }

// declare namespace Session {
//   export interface Request {
//     user: { [key: string]: string };
//   }
//   export interface Response {
//     user: { [key: string]: string };
//   }
// }

// declare module "express-session" {
//   export interface SessionData {
//     user: string;
//   }
// }