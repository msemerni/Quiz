import { createClient } from "redis";
import { promisify } from "util";
import { IDBQuestion, IGameLinkObject, IUserStatistics, IGameStatistics, GameStatus, IError } from "../../types/project-types";
const { QUIZ_LINK_VALIDITY_TIME} = process.env;


// const getDataFromRedis = async (key: string, redisClient: ReturnType<typeof createClient>) => {
//   return await promisify(redisClient.get).bind(redisClient)(key);
// }

// const setDataToRedis = async (key: string, value: number | string, redisClient: ReturnType<typeof createClient>): Promise<void> => {
//   await redisClient.set(key, value);
// }
 

const getGameObject = async (gameUUID: string, redisClient: ReturnType<typeof createClient>): Promise<IGameLinkObject> => {
  const gameObject: string = await promisify(redisClient.get).bind(redisClient)(gameUUID);
  const parsedGameObject: IGameLinkObject = JSON.parse(gameObject);
  console.log("&&_getGameObject: ",parsedGameObject);
  return parsedGameObject;
}

 
const setGameObject = async (gameObject: IGameLinkObject, redisClient: ReturnType<typeof createClient>): Promise<void> => {
  // console.log("GO:", gameObject);
  const gameObjectStr = JSON.stringify(gameObject);
  const gameUUIDStr = gameObject.gameUUID;

  let linkValidityTime;

  if (QUIZ_LINK_VALIDITY_TIME) {
    linkValidityTime = +QUIZ_LINK_VALIDITY_TIME;
  } else {
    linkValidityTime = 3600;
  }

  await redisClient.setEx(gameUUIDStr, linkValidityTime, gameObjectStr);
}


const changeGameStatus = async (gameUUID: string, status: string, redisClient: ReturnType<typeof createClient>): Promise<void> => {
  const gameObject: IGameLinkObject = await getGameObject(gameUUID, redisClient);

  if (status === "created") {
    gameObject.gameStatus = GameStatus.created;
  }else if (status === "process") {
    gameObject.gameStatus = GameStatus.process;
  }else if (status === "finished") {
    gameObject.gameStatus = GameStatus.finished;
  }else {
    throw new Error ("wrong status");
  }

  await setGameObject(gameObject, redisClient);
}

const resetIsUsersAnsweredCurrentQuestion = async (gameUUID: string, redisClient: ReturnType<typeof createClient>): Promise<void> => {
  const gameObject: IGameLinkObject = await getGameObject(gameUUID, redisClient);

      for (const user of gameObject.users) {
      if (Object.keys(user).includes(userIdStr)) {
        user[userIdStr].isAnsweredCurrentQuestion = false;

      }
    }

  await setGameObject(gameObject, redisClient);
}



const getAllQuestions = async (gameUUID: string, redisClient: ReturnType<typeof createClient>): Promise<Array<IDBQuestion> | null> => {
  const gameObject: IGameLinkObject = await getGameObject(gameUUID, redisClient);
  const questions: Array<IDBQuestion> = gameObject.quizQuestions;

  return questions;
}


const getOneQuestion = async (gameUUID: string, redisClient: ReturnType<typeof createClient>): Promise<IDBQuestion | null> => {
  const gameObject: IGameLinkObject = await getGameObject(gameUUID, redisClient);
  const questions: Array<IDBQuestion> | null = gameObject.quizQuestions;
  const currentQuestionNum: number | null = gameObject.currentQuestionNumber;

  if (currentQuestionNum >= questions.length) {
    return null;
  }

  const question: IDBQuestion = questions[currentQuestionNum];

  return question;
}


// const getCurrentQuestionNumber = async (gameUUID: string, redisClient: ReturnType<typeof createClient>): Promise<number | null> => {
//   const gameObject: IGameLinkObject = await getGameObject(gameUUID, redisClient);
  
//   // const gameOptionsObject: string = await promisify(redisClient.get).bind(redisClient)(gameUUID);
//   // const gameOptionsObjectParsed: IGameLinkObject = JSON.parse(gameOptionsObject);

//   const currentQuestionNumber: number = gameObject.currentQuestionNumber;
//   console.log("**currentQuestionNumber**", currentQuestionNumber);
  
//   return currentQuestionNumber;
// }


const getGameStatistics = async (gameUUID: string, redisClient: ReturnType<typeof createClient>): Promise<IGameStatistics | null> => {
  const gameObject: IGameLinkObject = await getGameObject(gameUUID, redisClient);
  const totalQuestionsCount: number = gameObject.quizQuestions.length;
  const statistics: Array<IUserStatistics> = gameObject.users;

  const gameStatistics: IGameStatistics = {totalQuestionsCount, statistics};

  return gameStatistics;
}






// userID, questionID, userAnswer, redisClient
const saveAnswerReview = async (answerReview: any, redisClient: ReturnType<typeof createClient>): Promise<void> => {
  const reviews: string = await promisify(redisClient.get).bind(redisClient)("answerReview");
  const reviewArray = JSON.parse(reviews);
  const answerObj = JSON.parse(answerReview);
  reviewArray.push(answerObj);
  const reviewArrayString = JSON.stringify(reviewArray);
  await redisClient.set("answerReview", reviewArrayString);
}


// const getAnswerReview = async (redisClient: ReturnType<typeof createClient>): Promise<string | null> => {
//   const answersReview: string = await promisify(redisClient.get).bind(redisClient)("answerReview");
//   return answersReview;
// }

const getCorrectAnswerCount = async (redisClient: ReturnType<typeof createClient>): Promise<string | null> => {
  const correctAnswerCount: string = await promisify(redisClient.get).bind(redisClient)("correctAnswersCount");
  return correctAnswerCount;
}



const registerAnswerAsCorrect = async (redisClient: ReturnType<typeof createClient>): Promise<void> => {
  // const correctAnswerCount: string | null = await getCorrectAnswerCount(redisClient);

  if (!correctAnswerCount) {
    throw new Error("Correct answers count not found");
  }
  await incrementCorrectAnswersCount(+correctAnswerCount, redisClient);
}

const incrementCorrectAnswersCount = async (correctAnswersCount: number, redisClient: ReturnType<typeof createClient>): Promise<void> => {
  await redisClient.set("correctAnswersCount", correctAnswersCount + 1);
}





// const resetCurrentQuestionNumber = async (redisClient: ReturnType<typeof createClient>): Promise<void> => {
//   await redisClient.set("currentQuestionNumber", 0);
// }


// const resetCorrectAnswersCount = async (redisClient: ReturnType<typeof createClient>): Promise<void> => {
//   await redisClient.set("correctAnswersCount", 0);
// }


// const incrementQuestionNumber = async (currentQuestionNum: number, redisClient: ReturnType<typeof createClient>): Promise<void> => {
//   await redisClient.set("currentQuestionNumber", currentQuestionNum + 1);
// }




export = { 
  getAllQuestions,
  getOneQuestion,
  // getCurrentQuestionNumber,
  // getCorrectAnswerCount,
  getGameObject,
  setGameObject,
  registerAnswerAsCorrect,
  // resetCurrentQuestionNumber,
  // resetCorrectAnswersCount,
  // getAnswerReview,
  saveAnswerReview,
  getGameStatistics,
  changeGameStatus,
  resetIsUsersAnsweredCurrentQuestion
 }
 