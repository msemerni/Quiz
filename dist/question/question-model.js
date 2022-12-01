"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const questionSchema = new mongoose.Schema({
    title: String,
    answers: []
}, { versionKey: false });
const Question = mongoose.model("Question", questionSchema);
exports.default = Question;
