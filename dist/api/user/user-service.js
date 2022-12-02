"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require('bcryptjs');
const User = require("./user-model");
const mongoose = require("mongoose");
// import { IUser } from "./types/user-type";
const createUser = ({ login, password, nick }) => __awaiter(void 0, void 0, void 0, function* () {
    const passwordHash = yield bcrypt.hash(password, 10);
    const newUser = yield new User({ login, password: passwordHash, nick });
    yield newUser.save();
    return newUser;
});
const findUser = ({ login }) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findOne({ login });
    return user;
});
const isCorrectPassword = ({ login, password }) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findOne({ login });
    const isCorrectPassword = yield bcrypt.compare(password, user.password);
    return isCorrectPassword;
});
const deleteUser = (_id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findByIdAndDelete({ _id: mongoose.Types.ObjectId(_id) });
    return user;
});
module.exports = { createUser, findUser, isCorrectPassword, deleteUser };
