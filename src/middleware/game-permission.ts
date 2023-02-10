import { Response, NextFunction } from 'express';
import { createClient } from "redis";
import { ObjectId } from "mongodb";
import { IGetUserAuthInfoRequest } from '../types/global';
import { IGameLinkObject } from "../types/project-types";
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

  for (const userObject of gameObject.users) {
    if (userObject.user._id === userSessionID) {
      return next();
    }
  }

  return res.status(401).send({ status: "error", message: "permission denied to this game" });
};

module.exports = gamePermission;
