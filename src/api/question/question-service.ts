import { Question } from "./question-model";
import { IQuestion, IUserQuestion, IDBQuestion, Answer, AnswerReview } from "../../types/project-types";
import { redisClient } from "../../server";
import { promisify } from "util";
// import RedisService from "./question-redis-service";
const { QUIZ_QUESTION_QUANTITY } = process.env;


const getAllQuestions = async (): Promise<Array<IDBQuestion> | null> => {
  const allQuestions: Array<IDBQuestion> | null = await Question.find();
  return allQuestions;
}


const startQuiz = async (): Promise<void> => {
  const quizQuestions: Array<IDBQuestion> | null = await getRandomQuizQuestions(+QUIZ_QUESTION_QUANTITY!);
  await redisClient.set("quizQuestions", JSON.stringify(quizQuestions));
  await redisClient.set("currentQuestionNumber", 0);
  await redisClient.set("correctAnswersCount", 0);
}


const getCurrentQuestionNumber = async (): Promise<string | null> => {
  const getPromiseFromRedis: Function = promisify(redisClient.get).bind(redisClient);
  const questionNumber: Promise<string | null> = await getPromiseFromRedis("currentQuestionNumber");
  // const questionNumber: Promise<string | null> = await RedisService.getFromRedis("currentQuestionNumber");

  return questionNumber;
}


const getCorrectAnswerCount = async (): Promise<string | null> => {
  const getPromiseFromRedis: Function = promisify(redisClient.get).bind(redisClient);
  const correctAnswerCount: Promise<string | null> = await getPromiseFromRedis("correctAnswersCount");
  return correctAnswerCount;
}


const saveCorrectAnswersCountToRedis = async (): Promise<void> => {
  const correctAnswerCount: string | null = await getCorrectAnswerCount();

  if (!correctAnswerCount) {
    throw new Error("Correct answers count not found");
  }

  await redisClient.set("correctAnswersCount", +correctAnswerCount + 1);
}


const saveNextQuestionNumberToRedis = async (): Promise<void | null> => {
  const questions: Array<IDBQuestion> | null = await getAllQuestionFromRedis();
  const currentQuestionNum: string | null = await getCurrentQuestionNumber();

  if (!questions || !currentQuestionNum) {
    throw new Error("No correspondent question in Redis");
  }

  await redisClient.set("currentQuestionNumber", +currentQuestionNum + 1);
}


const checkAnswerResult = async (_id: string, userAnswer: string = ""): Promise<AnswerReview | null> => {
  const questions: Array<IDBQuestion> | null = await getAllQuestionFromRedis();
  const currentQuestionNum: string | null = await getCurrentQuestionNumber();

  if (!questions || !currentQuestionNum || +currentQuestionNum >= questions.length) {
    throw new Error("No correspondent question in Redis");
  }

  const currentQuestion: IDBQuestion | undefined = questions.find(question => question._id === _id);
  if (!currentQuestion || !currentQuestion.answers) {
    throw new Error("No correspondent question in Redis");
  }

  const correctAnswer: Answer | undefined = currentQuestion.answers.find(answer => Object.values(answer)[0] === true);
  if (!correctAnswer) {
    throw new Error("Correct answer not found in Redis");
  }

  let isCorrectAnswer: boolean = false;

  if (Object.keys(correctAnswer)[0] === userAnswer) {
    isCorrectAnswer = true;
    await saveCorrectAnswersCountToRedis();
  }

  const title: string = currentQuestion.title;

  const answerReview: AnswerReview = {
    _id: _id,
    title: title,
    userAnswer: userAnswer,
    correctAnswer: Object.keys(correctAnswer)[0],
    isCorrectAnswer: isCorrectAnswer
  };

  await saveNextQuestionNumberToRedis();
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


const getAllQuestionFromRedis = async (): Promise<Array<IDBQuestion> | null> => {
  return new Promise((resolve, reject) => {
    redisClient.get('quizQuestions', (err: any, keys: string | null) => {
      if (err) {
        reject(err);
      }

      if (!keys) {
        resolve(null);
      }

      const questions: Array<IDBQuestion> = JSON.parse(keys!);
      resolve(questions);
    });
  })
}


const getOneQuestionFromRedis = async (): Promise<IDBQuestion | null> => {
  const questions: Array<IDBQuestion> | null = await getAllQuestionFromRedis();
  const currentQuestionNum: string | null = await getCurrentQuestionNumber();

  if (!currentQuestionNum || !questions) {
    throw new Error("No correspondent question in Redis");
  }

  if (+currentQuestionNum >= questions.length) {
    return null;
  }

  const question: IDBQuestion = questions[+currentQuestionNum];
  return question;
}


const hideCorrectAnswers = (rawQuestion: IDBQuestion): IUserQuestion => {
  const answersArray: Array<String> = [];
  const { _id, title, answers }: { _id: string, title: string, answers: Array<Answer> } = rawQuestion;

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


export = {
  getAllQuestions,
  getQuestionById,
  upsertQuestion,
  deleteQuestion,
  getRandomQuizQuestions,
  getOneQuestionFromRedis,
  getAllQuestionFromRedis,
  hideCorrectAnswers,
  startQuiz,
  checkAnswerResult,
  getCurrentQuestionNumber,
  getCorrectAnswerCount,
  saveNextQuestionNumberToRedis
};
