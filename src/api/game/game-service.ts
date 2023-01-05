import { IDBUser, IGameLinkObject } from "../../types/project-types";
import UserService from "../user/user-service";
import { encrypt, decrypt } from "../../utils/cryptojs";
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from "mongodb";
require('dotenv').config();

const { URL, PORT } = process.env;

const generateGameLink = async (gameName: string, initiatorUserID: ObjectId, opponentUserID: ObjectId): Promise<string> => {
  const initiatorUser: IDBUser | null = await UserService.getUserById(initiatorUserID);
  const opponentUser: IDBUser | null = await UserService.getUserById(opponentUserID);

  if (!initiatorUser || !opponentUser) {
    throw new Error("user not found in the DB");
  }

  const gameUUID: string = uuidv4();
  const linkCreationTime: number = Date.now();
  const gameLinkObject: IGameLinkObject = { gameUUID, gameName, initiatorUser, opponentUser, linkCreationTime };
  const token: string = encrypt(JSON.stringify(gameLinkObject));
  const gameLink: string = `${URL}:${PORT}/game/${token}`;

  return gameLink;
}

const decodeToken = async (token: string): Promise<IGameLinkObject> => {
  const [data, iv ]: Array<string> = token.split(":");
  const decodedToken: IGameLinkObject = JSON.parse(decrypt(data, iv));
  const linkCreationTime: number = +decodedToken.linkCreationTime;
  const dateNow: number = Date.now();
  const timeDiff: number = dateNow - linkCreationTime;

  if (timeDiff > 5 * 60 * 1000) {
    throw new Error("token expired");
  }

  return decodedToken;
}

export { generateGameLink, decodeToken };
