import { Request, Response } from "express";
import { validateUserData } from "../../validators/joi-validator";
import UserService from "./user-service";
import { IUser } from "../../types/project-types";
import Joi from "joi";
import { ObjectId } from "mongodb";

const SignUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const user: IUser = req.body;
    const {login, password, nick}: { login: string, password: string, nick?: string} = user;
    console.log(Joi);
    
    const isValidNewUser: Joi.ValidationResult<IUser> = validateUserData(user);
    console.log(isValidNewUser);

    if (isValidNewUser.error) {
      res.status(401).send(isValidNewUser);
      return;
    }

    const userDB: IUser | null = await UserService.findUser({ login });

    if (userDB) {
      res.status(401).send({ status: "error", message: "user already exist" });
      return;
    }

    const newUser: IUser = await UserService.createUser({ login, password, nick: nick || "anon" })
    req.session.user = newUser;

    const savedUser: {login: string, nick: string | undefined} = { login: newUser.login, nick: newUser.nick }
    res.status(201).send(savedUser);

  } catch (error: any) {
    res.status(500).send({error: error.message});
  }
};


const LogIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { login, password }: { login: string, password: string} = req.body;
    const user: IUser | null = await UserService.findUser({ login });

    if (!user) {
      res.status(401).send({ status: "error", message: "user not found" });
      return;
    }

    const isCorrectPassword: boolean = await UserService.isCorrectPassword({ login, password });

    if (isCorrectPassword) {
      req.session.user = user;
      const authorizedUser: { _id: ObjectId, login: string, nick?: string} = { _id: user._id, login: user.login, nick: user.nick };
      res.status(200).send(authorizedUser);
      return
    }

    res.status(401).send({ status: "error", message: "wrong password" });
    
  } catch (error: any) {
    res.status(500).send({error: error.message});
  }
}


const LogOut = async (req: Request, res: Response): Promise<void> => {
  try {
    req.session.destroy(() => {
      res.status(200).json({ status: "success", message: "logout success" })
    });

  } catch (error: any) {
    res.status(500).send({error: error.message});
  }
}


const DeleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user: IUser | null = await UserService.deleteUser(req.params.id);

    if (user === null) {
      return;
    }

    const deletedUser: { _id: ObjectId, login: string, nick?: string} = { _id: user._id, login: user.login, nick: user.nick };
    res.status(200).send(deletedUser);
    
  } catch (error: any) {
    res.status(500).send({error: error.message});
  }
}


const GetAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users: Array<IUser> | null = await UserService.getAllUsers();
    res.status(200).send(users);

  } catch (error: any) {
    res.status(500).send({error: error.message});
  }
}

const GetUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userID: string = req.params.id;
    const userById: IUser | null = await UserService.getUserById(userID as unknown as ObjectId)
    res.status(200).send(userById);
    
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}


export { SignUp, LogIn, LogOut, DeleteUser, GetAllUsers, GetUserById };
