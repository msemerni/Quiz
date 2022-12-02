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
const protectAccess = require("./middleware/auth.js");
const { ShowQuestions, ShowQuestionById, CreateNewQuestion, UpdateQuestion, DeleteQuestion } = require("./question-service.js");
// show all questions
app.get("/question", protectAccess, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    ShowQuestions(res);
}));
// show question by ID
app.get("/question/:id", protectAccess, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    ShowQuestionById(req, res);
}));
// create new question
app.post("/question", protectAccess, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    CreateNewQuestion(req, res);
}));
// update question:
app.put("/question/:id", protectAccess, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    UpdateQuestion(req, res);
}));
// delete question
app.delete("/question/:id", protectAccess, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    DeleteQuestion(req, res);
}));
