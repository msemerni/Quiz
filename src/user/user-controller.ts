import { Request, Response } from 'express';
const app = require("../server.js");
const { SignUp, LogIn, LogOut } = require("./user-service.js");

// create new user
app.post("/user/signup", async (req: Request, res: Response) => {
  SignUp(req, res);
});

// login
app.post("/user/login", async (req: Request, res: Response) => {
  LogIn(req, res);
});

// logout
app.get("/user/logout", async (req: Request, res: Response) => {
  LogOut(req, res);
});
