const bcrypt = require('bcryptjs');
import { Hash } from 'crypto';
const User = require("./user-model");
const mongoose = require("mongoose");
// import { IUser } from "./types/project-types";

const createUser = async ({ login, password, nick }: { login: string, password: string, nick: string }) => {
  const passwordHash: Hash = await bcrypt.hash(password, 10);
  const newUser = await new User({ login, password: passwordHash, nick });
  await newUser.save();
  return newUser;
}

const findUser = async ({ login }: { login: string }) => {
  const user = await User.findOne({ login });
  return user;
}

const isCorrectPassword = async ({ login, password }: { login: string, password: string }) => {
  const user = await User.findOne({ login });
  const isCorrectPassword = await bcrypt.compare(password, user.password);
  return isCorrectPassword;
}

const deleteUser = async (_id: string) => {
  const user = await User.findByIdAndDelete({ _id: mongoose.Types.ObjectId(_id) })
  return user;
}

module.exports = { createUser, findUser, isCorrectPassword, deleteUser };
