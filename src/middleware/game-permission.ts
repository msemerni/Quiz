import { Response, NextFunction } from 'express';
import { createClient } from "redis";
import { ObjectId } from "mongodb";
import { IGetUserAuthInfoRequest } from '../types/global';
import { IGameLinkObject, IUserStatistics } from "../types/project-types";
import RedisService from "../api/question/question-redis-service";
require('dotenv').config();

const gamePermission = async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
  const redisClient: ReturnType<typeof createClient> = req.app.get("redisClient");
  const { user } = req.session;
  const userSessionID = user._id;
  const gameUUID: string = req.params.gameuuid;
  const gameObject: IGameLinkObject = await RedisService.getGameObject(gameUUID, redisClient);

  if (!gameObject) {
    return res.status(401).send({ status: "error", message: "game not found or link expired" });
  }

  const initiatorID: ObjectId = gameObject.initiator.user._id;
  const opponentID: ObjectId = gameObject.opponent.user._id;

  if (userSessionID === initiatorID || userSessionID === opponentID) {
    return next();
  }

  return res.status(401).send({ status: "error", message: "permission denied to this game" });
};

module.exports = gamePermission;
