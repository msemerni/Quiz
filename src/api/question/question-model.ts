import { Request, Response } from 'express';
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    title: String,
    answers: []
  },
  { versionKey: false }
);

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
