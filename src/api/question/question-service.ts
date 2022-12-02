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

const createQuestion = async (question: {title: string, answers: Array<String>}) => {
  const newQuestion = new Question(question);
  await newQuestion.save();
  return newQuestion;
}

// const updateQuestion = async () => {

// }

const deleteQuestion = async (_id: string) => {
  const deletedQuestion = await Question.findByIdAndDelete({ _id: mongoose.Types.ObjectId(_id) })
  return deletedQuestion;
}

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  // updateQuestion,
  deleteQuestion
};
