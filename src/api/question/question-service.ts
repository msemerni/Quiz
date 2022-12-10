import { Question } from "./question-model";
import { IQuestion } from "../../types/project-types";

const getAllQuestions = async (): Promise<Array<IQuestion> | null>  => {
  const allQuestions: Array<IQuestion> | null  = await Question.find();
  return allQuestions;
}

const getQuestionById = async (_id: string): Promise<IQuestion | null> => {
  const question: IQuestion | null = await Question.findOne({ _id });
  return question;
}

const upsertQuestion = async (upsertQuestion: IQuestion): Promise<IQuestion | null> => {
  const question: IQuestion | null = await Question.findOne({ _id: upsertQuestion._id });

  if (!question) {
    const newQuestion: IQuestion = new Question(upsertQuestion);
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

const deleteQuestion = async (_id: string): Promise<IQuestion | null> => {
  const deletedQuestion: IQuestion | null = await Question.findByIdAndDelete({ _id })
  return deletedQuestion;
}

export = { getAllQuestions, getQuestionById, upsertQuestion, deleteQuestion };
