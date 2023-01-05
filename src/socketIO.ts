import { decrypt } from "./utils/cryptojs";
import { IGameLinkObject } from "./types/project-types";

module.exports = function (io: any) {
  io.on('connection', (socket: any) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('disconnect', function () {
      console.log(`User disconnected: ${socket.id}`);
    });

    socket.on('create game', (gameLink: any) => {
      const token: string = gameLink.slice(gameLink.lastIndexOf('/') + 1);
      const [string, iv]: Array<string> = token.split(":");
      const decodedToken: IGameLinkObject = JSON.parse(decrypt(string, iv));
      const roomGameID: string = decodedToken.gameUUID;

      socket.join(roomGameID);
      io.to(roomGameID).emit('game created', decodedToken.initiatorUser.login, roomGameID);
    })
  });
}

