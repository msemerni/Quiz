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
const Question = require("./user/question-model");
const mongoose = require("mongoose");
// type QuestionType = {
//     .......
//   }
const ShowQuestions = (res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.send(yield Question.find());
    }
    catch (error) {
        res.status(500).json({ "error": error });
    }
});
const ShowQuestionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.send(yield Question.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }));
    }
    catch (error) {
        res.status(500).json({ "error": error });
    }
});
const CreateNewQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newQuestion = new Question(req.body);
        yield newQuestion.save();
        res.status(201).send(newQuestion);
    }
    catch (error) {
        res.status(500).json({ "error": error });
    }
});
const UpdateQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _id = req.params.id;
        const { title, answers } = req.body;
        const question = yield Question.findOne({ _id });
        if (!question) {
            const newQuestion = new Question(req.body);
            yield newQuestion.save();
            res.status(201).send(newQuestion);
        }
        else {
            if (title) {
                question.title = title;
            }
            if (answers) {
                question.answers = answers;
            }
            yield question.save();
            res.status(200).send(question);
        }
    }
    catch (error) {
        res.status(500).json({ "error": error });
    }
});
const DeleteQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.send(yield Question.findByIdAndDelete({ _id: mongoose.Types.ObjectId(req.params.id) }));
    }
    catch (error) {
        res.status(500).json({ "error": error });
    }
});
module.exports = {
    ShowQuestions,
    ShowQuestionById,
    CreateNewQuestion,
    UpdateQuestion,
    DeleteQuestion
};
