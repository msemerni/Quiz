import { createClient } from "redis";
import { promisify } from "util";
import { IDBQuestion } from "../../types/project-types";


// const getDataFromRedis = async (key: string, redisClient: ReturnType<typeof createClient>) => {
//   return await promisify(redisClient.get).bind(redisClient)(key);
// }

// const setDataToRedis = async (key: string, value: number | string, redisClient: ReturnType<typeof createClient>): Promise<void> => {
//   await redisClient.set(key, value);
// }


const setQuizQuestions = async (quizQuestions: string, redisClient: ReturnType<typeof createClient>): Promise<void> => {
  await redisClient.set("quizQuestions", quizQuestions);
  await redisClient.set("answerReview", "[]");
}


const resetCurrentQuestionNumber = async (redisClient: ReturnType<typeof createClient>): Promise<void> => {
  await redisClient.set("currentQuestionNumber", 0);
}


const resetCorrectAnswersCount = async (redisClient: ReturnType<typeof createClient>): Promise<void> => {
  await redisClient.set("correctAnswersCount", 0);
}


const incrementQuestionNumber = async (currentQuestionNum: number, redisClient: ReturnType<typeof createClient>): Promise<void> => {
  await redisClient.set("currentQuestionNumber", currentQuestionNum + 1);
}


const incrementCorrectAnswersCount = async (correctAnswersCount: number, redisClient: ReturnType<typeof createClient>): Promise<void> => {
  await redisClient.set("correctAnswersCount", correctAnswersCount + 1);
}


const getAllQuestions = async (redisClient: ReturnType<typeof createClient>): Promise<Array<IDBQuestion> | null> => {
  const questions: string = await promisify(redisClient.get).bind(redisClient)("quizQuestions");
  const parsedQuestions = JSON.parse(questions);
  return parsedQuestions;
}


const getOneQuestion = async (redisClient: ReturnType<typeof createClient>): Promise<IDBQuestion | null> => {
  const questions: Array<IDBQuestion> | null = await getAllQuestions(redisClient);
  const currentQuestionNum: string | null = await getCurrentQuestionNumber(redisClient);

  if (!currentQuestionNum || !questions) {
    throw new Error("No correspondent question in Redis");
  }

  if (+currentQuestionNum >= questions.length) {
    return null;
  }

  const question: IDBQuestion = questions[+currentQuestionNum];

  return question;
}

const getAnswerReview = async (redisClient: ReturnType<typeof createClient>): Promise<string | null> => {
  const answersReview: string = await promisify(redisClient.get).bind(redisClient)("answerReview");
  return answersReview;
}

const getCurrentQuestionNumber = async (redisClient: ReturnType<typeof createClient>): Promise<string | null> => {
  const questionNumber: string = await promisify(redisClient.get).bind(redisClient)("currentQuestionNumber");
  return questionNumber;
}


const getCorrectAnswerCount = async (redisClient: ReturnType<typeof createClient>): Promise<string | null> => {
  const correctAnswerCount: string = await promisify(redisClient.get).bind(redisClient)("correctAnswersCount");
  return correctAnswerCount;
}


const setNextQuestionNumber = async (redisClient: ReturnType<typeof createClient>): Promise<void | null> => {
  const questions: Array<IDBQuestion> | null = await getAllQuestions(redisClient);
  const currentQuestionNum: string | null = await getCurrentQuestionNumber(redisClient);

  if (!questions || !currentQuestionNum) {
    throw new Error("No correspondent question in Redis");
  }
  await incrementQuestionNumber(+currentQuestionNum, redisClient);
}

const registerAnswerAsCorrect = async (redisClient: ReturnType<typeof createClient>): Promise<void> => {
  const correctAnswerCount: string | null = await getCorrectAnswerCount(redisClient);

  if (!correctAnswerCount) {
    throw new Error("Correct answers count not found");
  }
  await incrementCorrectAnswersCount(+correctAnswerCount, redisClient);
}

const setAnswerReview = async (answerReview: any, redisClient: ReturnType<typeof createClient>): Promise<void> => {
  const reviews: string = await promisify(redisClient.get).bind(redisClient)("answerReview");
  const reviewArray = JSON.parse(reviews);
  const answerObj = JSON.parse(answerReview);
  reviewArray.push(answerObj);
  const reviewArrayString = JSON.stringify(reviewArray);
  await redisClient.set("answerReview", reviewArrayString);
}

export = { 
  getAllQuestions,
  getOneQuestion,
  getCurrentQuestionNumber,
  getCorrectAnswerCount,
  setQuizQuestions,
  setNextQuestionNumber,
  registerAnswerAsCorrect,
  resetCurrentQuestionNumber,
  resetCorrectAnswersCount,
  setAnswerReview,
  getAnswerReview
 }
