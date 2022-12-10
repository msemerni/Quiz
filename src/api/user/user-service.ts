import bcrypt from "bcryptjs";
import { User } from "./user-model";
import { IUser } from "../../types/project-types";
const { SALT } = process.env;

const createUser = async ({ login, password, nick }: 
                          { login: string, password: string, nick: string }): Promise<IUser> => {
  const passwordHash: string = await bcrypt.hash(password, SALT as string);
  const newUser: IUser = await User.create({ login, password: passwordHash, nick });
  await newUser.save();
  return newUser;
}

const findUser = async ({ login }: { login: string }): Promise<IUser | null> => {
  const user: IUser | null = await User.findOne({ login });
  return user;
}

const isCorrectPassword = async ({ login, password }: 
                                 { login: string, password: string }): Promise<boolean> => {
  const user: IUser | null = await User.findOne({ login });

  if (user === null) {
    return false;
  }

  const isCorrectPassword: boolean = await bcrypt.compare(password, user.password);
  return isCorrectPassword;
}

const deleteUser = async (_id: string): Promise<IUser | null> => {
  const user: IUser | null = await User.findByIdAndDelete({ _id });
  return user;
}

export = { createUser, findUser, isCorrectPassword, deleteUser };
