import { decrypt } from "./utils/cryptojs";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import RedisService from "./api/question/question-redis-service"; 
import { createClient } from "redis";
import { IGameLinkObject } from "./types/project-types";
import { redisClient } from "./server";

// module.exports = function (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
  module.exports = function (io: any) {
  io.on('connection', (socket: Socket) => {
    console.log(`USER CONNECTED: ${socket.id}`);

      

    socket.on('disconnect', () => {
      console.log(`USER DISCONNECTED: ${socket.id}`);
    });

    socket.on('create game', (gameUUID: string) => {

      console.log("_GAMEUUID_: ", gameUUID);
      
      socket.join(gameUUID);

      ///////////////
      // const rooms = io.sockets.adapter.rooms;
      // const gameRoomClients = rooms.get(gameUUID)
      // const playersNum = gameRoomClients.size;
      // console.log(`CLIENTS IN ROOM ${gameUUID}: `, gameRoomClients);
      // console.log("PLAYERS_NUM: ", playersNum);
      // console.log("SOCKET.ROOMS:", socket.rooms);

      io.to(gameUUID).emit('game created', gameUUID);
    });

    socket.on('invitation accepted', async (gameUUID: string, userID: string) => {
      console.log("INV_ACC_GAME_UUID:", gameUUID, userID);

      const gameObject: IGameLinkObject = await RedisService.getGameObject(gameUUID, redisClient);
      console.log("IO_inv: gameObject:::", gameObject);

      for (const userObject of gameObject.users) {
        if (userObject.user._id.toString() === userID) {
          socket.join(gameUUID);
          io.to(gameUUID).emit('game start', gameUUID);
        }
      } 
 
      // const rooms = io.sockets.adapter.rooms;
      // const gameRoomClients = rooms.get(gameUUID);
      // const playersNum = gameRoomClients.size;
      // console.log(`__CLIENTS IN ROOM ${gameUUID}: `, gameRoomClients);
      // console.log("__PLAYERS_NUM: ", playersNum);
      // console.log("__SOCKET.ROOMS:", socket.rooms);

      // const usersSockets = gameRoomClients.keys();
      // console.log("usersSockets: ", usersSockets);
      
      
     
    });


    // socket.on('user answer', async (gameUUID, userID) => {
    //   // io.to(gameUUID).emit('user answer accepted', userID);


    //   //// ТУТ ПРОВЕРКА ОТВЕТИЛИ ЛИ ОБА ЮЗЕРА =>
    //   if(true) {
    //     gameObject.currentQuestionNumber++;
    //     await RedisService.setGameObject(gameObject, redisClient);
    //   }
      

    //   const rooms = io.sockets.adapter.rooms;
    //   const gameRoomClients = rooms.get(gameUUID);
    //   const playersNum = gameRoomClients.size;
    //   console.log(`#__CLIENTS IN ROOM ${gameUUID}: `, gameRoomClients);
    //   console.log("#__PLAYERS_NUM: ", playersNum);
    //   console.log("#__SOCKET.ROOMS:", socket.rooms);

    //   const usersSockets = gameRoomClients.keys();
    //   console.log("#usersSockets: ", usersSockets);

    // });
    
  































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
