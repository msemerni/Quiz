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
  // console.log("&&_getGameObject: ",parsedGameObject);
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

const updateGameObject = async (gameObject: IGameLinkObject, redisClient: ReturnType<typeof createClient>): Promise<void> => {
  // console.log("GO:", gameObject);
  const gameObjectStr = JSON.stringify(gameObject);
  const gameUUIDStr = gameObject.gameUUID;
  await redisClient.set(gameUUIDStr, gameObjectStr);
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

  await updateGameObject(gameObject, redisClient);
}

const resetIsUsersAnsweredCurrentQuestion = async (gameUUID: string, redisClient: ReturnType<typeof createClient>): Promise<void> => {
  const gameObject: IGameLinkObject = await getGameObject(gameUUID, redisClient);

  for (const userObject of gameObject.users) {
    userObject.isAnsweredCurrentQuestion = false;
  }

  await updateGameObject(gameObject, redisClient);
}

const setCurrentQuestionSendTime = async (gameUUID: string, redisClient: ReturnType<typeof createClient>): Promise<void> => {
  const gameObject: IGameLinkObject = await getGameObject(gameUUID, redisClient);
  gameObject.currentQuestionSendTime = Date.now();
  await updateGameObject(gameObject, redisClient);
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


const getGameStatistics = async (gameUUID: string, redisClient: ReturnType<typeof createClient>): Promise<IGameStatistics | null> => {
  const gameObject: IGameLinkObject = await getGameObject(gameUUID, redisClient);
  const totalQuestionsCount: number = gameObject.quizQuestions.length;
  const statistics: Array<IUserStatistics> = gameObject.users;

  const gameStatistics: IGameStatistics = {totalQuestionsCount, statistics};

  return gameStatistics;
}

const incrementCurrentQuestionNumber = async (gameUUID: string, redisClient: ReturnType<typeof createClient>): Promise<void> => {
  const gameObject: IGameLinkObject | null = await getGameObject(gameUUID, redisClient);
  gameObject.currentQuestionNumber++;
  await updateGameObject(gameObject, redisClient);
}


export = { 
  getAllQuestions,
  getOneQuestion,
  getGameObject,
  setGameObject,
  updateGameObject,
  getGameStatistics,
  changeGameStatus,
  resetIsUsersAnsweredCurrentQuestion,
  incrementCurrentQuestionNumber,
  setCurrentQuestionSendTime
 }
 