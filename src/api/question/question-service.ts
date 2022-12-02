import { Request, Response } from 'express';
const Question = require("./question-model");
const mongoose = require("mongoose");
// import { IQuestion } from "./types/project-types";

const getQuestions = async () => {
  const allQuestions = await Question.find();
  return allQuestions;
}

const getQuestionById = async (_id: string) => {
  const question = await Question.findOne({ _id: mongoose.Types.ObjectId(_id) });
  return question;
}

const upsertQuestion = async (upsertQuestion: any) => {
  const question = await Question.findOne({ _id: mongoose.Types.ObjectId(upsertQuestion._id) });

  if (!question) {
    const newQuestion = new Question(upsertQuestion);
    await newQuestion.save();
    return newQuestion;

  } else {
    if (upsertQuestion.title) {
      question.title = upsertQuestion.title;
    }
    if (upsertQuestion.answers) {
      question.answers = upsertQuestion.answers;
    }
    await question.save();
    return question;
  }
}

const deleteQuestion = async (_id: string) => {
  const deletedQuestion = await Question.findByIdAndDelete({ _id: mongoose.Types.ObjectId(_id) })
  return deletedQuestion;
}

module.exports = { getQuestions, getQuestionById, upsertQuestion, deleteQuestion };
