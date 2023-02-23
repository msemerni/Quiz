import { Server, Socket } from "socket.io";
import RedisService from "./api/game/game-redis-service";
import { IGameLinkObject } from "./types/project-types";
import { redisClient } from "./server";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

module.exports = function (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
  io.on('connection', (socket: Socket) => {
    console.log(`USER CONNECTED: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`USER DISCONNECTED: ${socket.id}`);
    });

    socket.on('create game', (gameUUID: string) => {
      socket.join(gameUUID);
      io.to(gameUUID).emit('game created', gameUUID);
    });

    socket.on('invitation accepted', async (gameUUID: string, userID: string) => {
      const gameObject: IGameLinkObject = await RedisService.getGameObject(gameUUID, redisClient);

      for (const userObject of gameObject.users) {
        if (userObject.user._id.toString() === userID) {
          socket.join(gameUUID);
          io.to(gameUUID).emit('game start', gameUUID);
        }
      }

    });
  });
};
