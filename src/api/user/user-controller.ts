import { Request, Response } from 'express';
import {joiSchema} from "../../validators/joi-validator";
const UserService = require('./user-service');

const SignUp = async (req: Request, res: Response) => {
  try {
    const { login, password, nick }: { login: string, password: string, nick: string } = req.body;
    const isNotValidNewUser = joiSchema.validate({ login, password, nick }).error;

    if (!isNotValidNewUser) {
      return res.status(401).send(isNotValidNewUser.details[0]);
    }

    const user = await UserService.findUser({ login });

    if (user) {
      return res.status(401).send({ status: "error", message: "user already exist" });
    }

    const newUser = await UserService.createUser({ login, password, nick: nick || "anon" })
    req.session.user = newUser;
    const savedUser = { login: newUser.login, nick: newUser.nick }
    res.status(201).send(savedUser);

  } catch (error: any) {
    res.status(500).send({error: error.message});
  }
};

const LogIn = async (req: Request, res: Response) => {
  try {
    const { login, password }: { login: string, password: string} = req.body;
    const user = await UserService.findUser({ login });

    if (!user) {
      return res.status(401).send({ status: "error", message: "user not found" });
    }

    const isCorrectPassword = await UserService.isCorrectPassword({ login, password });

    if (isCorrectPassword) {
      req.session.user = user;
      const authorizedUser = { _id: user._id, login: user.login, nick: user.nick };
      return res.status(200).send(authorizedUser);
    }

    res.status(401).send({ status: "error", message: "wrong password" });
    
  } catch (error: any) {
    res.status(500).send({error: error.message});
  }
}

const LogOut = async (req: Request, res: Response) => {
  try {
    req.session.destroy(() => {
      res.status(200).json({ status: "success", message: "logout success" })
    });

  } catch (error: any) {
    res.status(500).send({error: error.message});
  }
}

const DeleteUser = async (req: Request, res: Response) => {
  try {
    const user = await UserService.deleteUser(req.params.id);
    const deletedUser = { _id: user._id, login: user.login, nick: user.nick };
    res.status(200).send(deletedUser);
    
  } catch (error: any) {
    res.status(500).send({error: error.message});
  }
}

module.exports = { SignUp, LogIn, LogOut, DeleteUser };
