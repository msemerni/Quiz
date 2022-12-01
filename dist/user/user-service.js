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
const joiSchema = require("./validators/joi-validator.js");
const User = require("./user/user-model");
const SignUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { login, password, nick } = req.body;
        const isNotValidNewUser = joiSchema.validate({ login, password, nick }).error;
        if (!isNotValidNewUser) {
            const isUserExist = yield User.findOne({ login });
            if (isUserExist) {
                return res.status(401).send({ status: "error", message: "user already exist" });
            }
            const passwordHash = yield bcrypt.hash(password, 10);
            const newUser = new User({ login, password: passwordHash, nick: nick || "anon" });
            yield newUser.save();
            req.session.user = newUser;
            res.status(201).send({ login: newUser.login, nick: newUser.nick });
        }
        else {
            res.status(401).send(isNotValidNewUser.details[0]);
        }
    }
    catch (error) {
        res.status(500).json({ "error": error });
    }
});
const LogIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { login, password } = req.body;
        const user = yield User.findOne({ login });
        if (!user) {
            res.status(401).send({ status: "error", message: "user not found" });
        }
        else {
            const isCorrectPassword = yield bcrypt.compare(password, user.password);
            if (isCorrectPassword) {
                req.session.user = user;
                return res.status(200).send({ _id: user._id, login: user.login, nick: user.nick });
            }
            res.status(401).send({ status: "error", message: "wrong password" });
        }
    }
    catch (error) {
        res.status(500).json({ "error": error });
    }
});
const LogOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.session.destroy(() => console.log("complete"));
        res.status(200).json({ status: "success", message: "logout success" });
    }
    catch (error) {
        res.status(500).json({ "error": error });
    }
});
module.exports = { SignUp, LogIn, LogOut };
