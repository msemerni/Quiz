import { Question } from "./question-model";
import { IQuestion, IUserQuestion, IDBQuestion, IAnswer, IAnswerReview } from "../../types/project-types";
import { createClient } from "redis";
import RedisService from "./question-redis-service";
const { QUIZ_QUESTION_QUANTITY } = process.env;

const getAllQuestions = async (): Promise<Array<IDBQuestion> | null> => {
  const allQuestions: Array<IDBQuestion> | null = await Question.find();
  return allQuestions;
}

const startQuiz = async (redisClient: ReturnType<typeof createClient>): Promise<void> => {
  const quizQuestions: Array<IDBQuestion> | null = await getRandomQuizQuestions(+QUIZ_QUESTION_QUANTITY!);
  await RedisService.setQuizQuestions(JSON.stringify(quizQuestions), redisClient);
  await RedisService.resetCurrentQuestionNumber(redisClient);
  await RedisService.resetCorrectAnswersCount(redisClient);
}

const getCorrectAnswer = (question: IDBQuestion): IAnswer => {
  const correctAnswer: IAnswer | undefined = question.answers.find(answer => Object.values(answer)[0] === true);
  if (!correctAnswer) {
    throw new Error("No correct answer in question");
  }
  return correctAnswer;
}

const isAnswerCorrect = (userAnswer: string, correctAnswer: IAnswer): boolean => {
  if (!correctAnswer) {
    throw new Error("No correct answer in question");
  }
  if (Object.keys(correctAnswer!)[0] === userAnswer) {
    return true;
  }
  return false;
}

const createAnswerReview = async (_id: string, userAnswer: string, redisClient: ReturnType<typeof createClient>): Promise<IAnswerReview> => {
  if (!userAnswer) {
    userAnswer = "";
  }
  
  const currentQuestion: IDBQuestion | null = await getQuestionById(_id);
  const questions: Array<IDBQuestion> | null = await RedisService.getAllQuestions(redisClient);
  const currentQuestionNum: string | null = await RedisService.getCurrentQuestionNumber(redisClient);

  if (!currentQuestion || !questions || !currentQuestionNum || +currentQuestionNum >= questions.length) {
    throw new Error("No correspondent question in Redis");
  }

  const correctAnswerDB: IAnswer = getCorrectAnswer(currentQuestion);
  const correctAnswer: string = Object.keys(correctAnswerDB)[0];
  const title = currentQuestion.title;
  const isCorrectAnswer: boolean = isAnswerCorrect(userAnswer, correctAnswerDB);
  isCorrectAnswer && await RedisService.registerAnswerAsCorrect(redisClient);
  const answerReview: IAnswerReview = {_id, title, userAnswer, correctAnswer, isCorrectAnswer};
  await RedisService.setNextQuestionNumber(redisClient);

  return answerReview;
}

const getRandomQuizQuestions = async (questionQuantity: number): Promise<Array<IDBQuestion> | null> => {
  if (!questionQuantity) {
    questionQuantity = 1;
  }

  const questions: Array<IDBQuestion> | null = await Question.aggregate(
    [{ $sample: { size: questionQuantity } }]
  )
  return questions;
}

const getQuestionById = async (_id: string): Promise<IDBQuestion | null> => {
  const question: IDBQuestion | null = await Question.findOne({ _id });
  return question;
}

const hideCorrectAnswers = (rawQuestion: IDBQuestion): IUserQuestion => {
  const answersArray: Array<String> = [];
  const { _id, title, answers }: { _id: string, title: string, answers: Array<IAnswer> } = rawQuestion;

  for (let i: number = 0; i < answers.length; i++) {
    const element = Object.keys(answers[i]);
    answersArray.push(element[0]);
  }

  const transformedQuestion: IUserQuestion = {
    _id: _id,
    title: title,
    answers: answersArray,
  }
  return transformedQuestion;
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
  const deletedQuestion: IDBQuestion | null = await Question.findByIdAndDelete({ _id })
  return deletedQuestion;
}

export {
  getAllQuestions,
  getQuestionById,
  upsertQuestion,
  deleteQuestion,
  getRandomQuizQuestions,
  hideCorrectAnswers,
  startQuiz,
  createAnswerReview,
};
