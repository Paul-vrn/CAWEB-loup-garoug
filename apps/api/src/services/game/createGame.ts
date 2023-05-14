import { NewGame } from "types";
import prisma from "../../prisma";
import { createDeadlineJob } from "../../services/scheduler";
import { checkDeadline } from "../time";

const createGame = async (game: NewGame, userId: string) => {
  if (!checkDeadline(new Date(game.deadline), new Date(game.startDay))) {
    console.log("Invalid deadline");
    return Promise.reject({ message: "Invalid deadline" });
  }
  return await prisma
    .$transaction(async transaction => {
      const dayChat = await transaction.dayChatRoom.create({
        data: {
          chatRoom: { create: {} },
        },
      });
      const nightChat = await transaction.nightChatRoom.create({
        data: {
          chatRoom: { create: {} },
        },
      });
      const spiritChat = await transaction.spiritChatRoom.create({
        data: {
          chatRoom: { create: {} },
        },
      });

      const newGame = await transaction.game.create({
        data: {
          ...game,
          dayChatRoomId: dayChat.id,
          nightChatRoomId: nightChat.id,
          spiritChatRoomId: spiritChat.id,
        },
      });

      // On ajoute le créateur de la partie à la partie
      await transaction.player.create({
        data: {
          userId: userId,
          gameId: newGame.id,
        },
      });

      return newGame;
    })
    .then(newGame => {
      createDeadlineJob(newGame.deadline, newGame.id, newGame.startDay);
      return Promise.resolve(newGame);
    })
    .catch(error => {
      return Promise.reject(error.message);
    });
};

export default createGame;
