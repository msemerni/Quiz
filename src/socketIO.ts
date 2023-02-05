import { decrypt } from "./utils/cryptojs";
import { IGameLinkObject, IGameLinkData } from "./types/project-types";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import RedisService from "./api/question/question-redis-service"; 
import { createClient } from "redis";
// import { redisClient } from "./server";

// module.exports = function (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
  module.exports = function (io: any) {
  io.on('connection', (socket: Socket) => {
    console.log(`USER CONNECTED: ${socket.id}`);

    socket.on('disconnect', function () {
      console.log(`USER DISCONNECTED: ${socket.id}`);
    });

    socket.on('create game', (gameLinkData: IGameLinkData) => {
      const gameLink = gameLinkData.gameLink;
      const gameUUID: string = gameLink.slice(gameLink.lastIndexOf('/') + 1);
      
      socket.join(gameUUID);

      // /// нужно ли это??:
      // io.to(gameUUID).emit('game created', gameLinkData);
    });

    socket.on('user answer', async (gameUUID: string, userID: string, userAnswer: string) => {
      console.log("USER_Answer:", gameUUID, userID, userAnswer);

      // const redisClient: ReturnType<typeof createClient> = req.app.get("redisClient");
      const gameObject: IGameLinkObject = await RedisService.getGameObject(gameUUID, redisClient);

      // console.log("gameObject:::", gameObject);
      // await RedisService.setGameObject(gameOptionsObject, redisClient);
     
    });































    
    // socket.on('user connect', (socketID: any, gameLink: any) => {
    //   socket.join(gameLink);
    //   io.to(gameLink).emit('user connected', socketID, gameLink);
  
    //   const rooms = io.sockets.adapter.rooms;
    //   const gameRoomClients = rooms.get(gameLink)
    //   const playersNum = gameRoomClients.size;
    //   console.log("CLIENTS: ", gameRoomClients);
    //   console.log("PLAYERS_NUM: ", playersNum);
    //   console.log("SOCKET.ROOMS:", socket.rooms);
   
    //   if (playersNum === 2) {
    //       io.to(gameLink).emit('game start', gameLink)
    //   }
    // });


  });
};
