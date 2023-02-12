import { Question } from "./question-model";
import { IQuestion, IDBQuestion} from "../../types/project-types";

const getAllQuestions = async (): Promise<Array<IDBQuestion> | null> => {
  const allQuestions: Array<IDBQuestion> | null = await Question.find();
  return allQuestions;
}

const getQuestionById = async (_id: string): Promise<IDBQuestion | null> => {
  const question: IDBQuestion | null = await Question.findOne({ _id });
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

const deleteQuestion = async (_id: string): Promise<IDBQuestion | null> => {
  const deletedQuestion: IDBQuestion | null = await Question.findByIdAndDelete({ _id });
  return deletedQuestion;
}

export {
  getAllQuestions,
  getQuestionById,
  upsertQuestion,
  deleteQuestion
};
