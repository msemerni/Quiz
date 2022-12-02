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
const joiSchema = require("../../validators/joi-validator.js");
const UserService = require('./user-service');
const SignUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { login, password, nick } = req.body;
        const isNotValidNewUser = joiSchema.validate({ login, password, nick }).error;
        if (!isNotValidNewUser) {
            return res.status(401).send(isNotValidNewUser.details[0]);
        }
        const user = yield UserService.findUser({ login });
        if (user) {
            return res.status(401).send({ status: "error", message: "user already exist" });
        }
        const newUser = yield UserService.createUser({ login, password, nick: nick || "anon" });
        req.session.user = newUser;
        res.status(201).send({ login: newUser.login, nick: newUser.nick });
    }
    catch (error) {
        /////// НЕ ВЫВОДИТ ОШИБКУ .json({ error })
        console.log(error);
        res.status(500).json({ error });
    }
});
const LogIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { login, password } = req.body;
        const user = yield UserService.findUser({ login });
        if (!user) {
            return res.status(401).send({ status: "error", message: "user not found" });
        }
        const isCorrectPassword = yield UserService.isCorrectPassword({ login, password });
        if (isCorrectPassword) {
            req.session.user = user;
            return res.status(200).send({ _id: user._id, login: user.login, nick: user.nick });
        }
        res.status(401).send({ status: "error", message: "wrong password" });
    }
    catch (error) {
        /////// НЕ ВЫВОДИТ ОШИБКУ .json({ error })
        console.log(error);
        res.status(500).json({ error });
    }
});
const LogOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.session.destroy(() => {
            res.status(200).json({ status: "success", message: "logout success" });
        });
    }
    catch (error) {
        /////// НЕ ВЫВОДИТ ОШИБКУ .json({ error })
        console.log(error);
        res.status(500).json({ error });
    }
});
const DeleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield UserService.deleteUser(req.params.id);
        res.send({ _id: user._id, login: user.login, nick: user.nick });
    }
    catch (error) {
        /////// НЕ ВЫВОДИТ ОШИБКУ .json({ error })
        console.log(error);
        res.status(500).json({ error });
    }
});
module.exports = { SignUp, LogIn, LogOut, DeleteUser };
