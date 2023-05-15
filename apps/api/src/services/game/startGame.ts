import { Player, Power, Role, StateGame } from "database";
import prisma from "../../prisma";
import notificationService from "../notification";
import { JobType, deleteJob } from "../scheduler";

const startGame = async (gameId: number) => {
  console.log("start startGame");
  return await prisma
    .$transaction(async transaction => {
      const game = await transaction.game.findUnique({
        where: { id: gameId },
        select: {
          id: true,
          name: true,
          state: true,
          minPlayer: true,
          wolfProb: true,
          seerProb: true,
          insomProb: true,
          contProb: true,
          spiritProb: true,
          dayChatRoomId: true,
          nightChatRoomId: true,
          players: {
            select: {
              userId: true,
              gameId: true,
              state: true,
              role: true,
              power: true,
              usedPower: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
      if (!game) {
        return;
      }
      // Ajout des joueurs dans les salons de discussion
      const players = game.players;
      if (players.length < game.minPlayer) {
        await transaction.game.delete({ where: { id: gameId } });
        await notificationService.gameDeleted(transaction, players, game.name);
        return Promise.resolve("Not enough players");
      }
      const playersChatters = players.map(player => ({
        gameId: player.gameId,
        playerId: player.userId,
        chatRoomId: game.dayChatRoomId,
      }));
      await transaction.reader.createMany({ data: playersChatters });
      await transaction.writer.createMany({ data: playersChatters });

      const numWerewolves = Math.max(Math.ceil(game.wolfProb * players.length), 1);
      const werewolves: Player[] = [];
      // attribution des loups garous
      while (werewolves.length < numWerewolves) {
        const randomPlayer = players[Math.floor(Math.random() * players.length)];
        if (!werewolves.includes(randomPlayer)) {
          randomPlayer.role = Role.WOLF;
          werewolves.push(randomPlayer);
        }
      }
      // Ajout des loups garous dans les salons de discussion
      const werewolfChatters = werewolves.map(werewolf => ({
        gameId: werewolf.gameId,
        playerId: werewolf.userId,
        chatRoomId: game.nightChatRoomId,
      }));
      await transaction.reader.createMany({
        data: werewolfChatters,
      });
      await transaction.writer.createMany({
        data: werewolfChatters,
      });

      let isInsomniac = Math.random() < game.insomProb;
      while (isInsomniac) {
        const insomniac = players[Math.floor(Math.random() * players.length)];
        if (insomniac.role !== Role.WOLF && insomniac.power === Power.NONE) {
          insomniac.power = Power.INSOMNIAC;
          isInsomniac = false;
          await transaction.reader.create({
            data: {
              gameId,
              playerId: insomniac.userId,
              chatRoomId: game.nightChatRoomId,
            },
          });
        }
      }

      let isContaminator = Math.random() < game.contProb;
      while (isContaminator) {
        const contaminator = players[Math.floor(Math.random() * players.length)];
        if (contaminator.role !== Role.VILLAGER && contaminator.power === Power.NONE) {
          contaminator.power = Power.CONTAMINATOR;
          isContaminator = false;
        }
      }

      // attribution des pouvoirs
      if (Math.random() < game.seerProb) {
        const seer = players[Math.floor(Math.random() * players.length)];
        if (seer.power === Power.NONE) seer.power = Power.SEER;
      }
      let isSpirit = Math.random() < game.spiritProb;
      while (isSpirit) {
        const spirit = players[Math.floor(Math.random() * players.length)];
        if (spirit.power === Power.NONE) {
          spirit.power = Power.SPIRIT;
          isSpirit = false;
        }
      }
      const playersUpdateTransaction = players.map(player => {
        return transaction.player.update({
          where: { userId_gameId: { userId: player.userId, gameId: player.gameId } },
          data: player,
        });
      });
      const playersUpdated = await Promise.all(playersUpdateTransaction); // update all players concurrently
      await notificationService.startGame(transaction, playersUpdated, game.name);
      await transaction.game.update({
        where: { id: gameId },
        data: {
          state: StateGame.DAY,
        },
      });
    })
    .then(() => {
      console.log("end startGame");
      deleteJob(gameId, JobType.DEADLINE);
      Promise.resolve();
    })
    .catch(error => {
      console.error(error);
    });
};

export default startGame;
