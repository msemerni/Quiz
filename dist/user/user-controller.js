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
const app = require("../server.js");
const { SignUp, LogIn, LogOut } = require("./user-service.js");
// create new user
app.post("/user/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    SignUp(req, res);
}));
// login
app.post("/user/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("R_E_Q:", req);
    LogIn(req, res);
}));
// logout
app.get("/user/logout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    LogOut(req, res);
}));
