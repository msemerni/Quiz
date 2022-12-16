import { Question } from "./question-model";
import { IQuestion, IUserQuestion, IDBQuestion, Answer, AnswerReview } from "../../types/project-types";
import { redisClient } from "../../server";
const { QUIZ_QUESTION_QUANTITY } = process.env;


const getAllQuestions = async (): Promise<Array<IDBQuestion> | null>  => {
  const allQuestions: Array<IDBQuestion> | null  = await Question.find();
  return allQuestions;
}


const saveQuizQuestionsToRedis = async (): Promise<void>  => {
  const quizQuestions: Array<IDBQuestion> | null = await getRandomQuizQuestions();
  await redisClient.set("quizQuest", JSON.stringify(quizQuestions));
}


const checkAnswerResult = async (_id: string, userAnswer: string = ""): Promise<AnswerReview | null> => {
  const questions: Array<IDBQuestion> | null = await getAllQuestionFromRedis();

  if (!questions) {
    return null;
  }

  let title: string = "";
  let correctAnswer: string = "";
  let isCorrectAnswer: boolean = false;

  for (let i: number = 0; i < questions.length; i++) {
    if (_id === questions[i]._id) {
      for (let j: number = 0; j < questions[i].answers.length; j++) {
        for (const [key, value] of Object.entries(questions[i].answers[j])) {
          if (value === true) {
            if (userAnswer === key) {
              isCorrectAnswer = true;
            }
            correctAnswer = key;
          }
        }
      }
      title = questions[i].title;
    }
  }

  const answerReview: AnswerReview = {
    _id: _id,
    title: title,
    userAnswer: userAnswer,
    correctAnswer: correctAnswer,
    isCorrectAnswer: isCorrectAnswer
  };

  return answerReview;
}


const getRandomQuizQuestions = async (questionQuantity: number = +QUIZ_QUESTION_QUANTITY!): Promise<Array<IDBQuestion> | null> => {
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
    redisClient.get('quizQuest', (err: any, keys: string | null) => {
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


const getOneQuestionFromRedis = async (questionNumber: number): Promise<IDBQuestion | null> => {
  const questions: Array<IDBQuestion> | null = await getAllQuestionFromRedis();

  if (!questions || questionNumber > questions.length) {
    return null;
  }

  const question: IDBQuestion = questions[questionNumber];

  return question;
}


const transformQuestion = (rawQuestion: IDBQuestion): IUserQuestion => {
  const answersArray: Array<String> = [];
  const {_id, title, answers}: {_id: string, title: string, answers: Array<Answer>}  = rawQuestion;
  
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
  transformQuestion,
  saveQuizQuestionsToRedis,
  checkAnswerResult
};
