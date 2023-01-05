import { createClient } from "redis";
import { promisify } from "util";

const getDataFromRedis = async (key: string, redisClient: ReturnType<typeof createClient>) => {
  return await promisify(redisClient.get).bind(redisClient)(key);
}

const setDataToRedis = async (key: string, value: number | string, redisClient: ReturnType<typeof createClient>): Promise<void> => {
  await redisClient.set(key, value);
}


export = { 
  getDataFromRedis,
  setDataToRedis
 }
