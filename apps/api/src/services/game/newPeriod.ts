import { Power, Role, StateGame, StatePlayer } from "database";
import prisma from "../../prisma";
import { finishElection } from "../election";
import notificationService from "../notification";
import { JobType, deleteJob } from "../scheduler";

const newPeriod = async (day: boolean, gameId: number) => {
  return await prisma
    .$transaction(async transaction => {
      let game = await transaction.game.findUniqueOrThrow({
        where: { id: gameId },
        select: {
          name: true,
          curElecId: true,
          state: true,
          spiritChatRoomId: true,
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
      if (game.curElecId !== null) {
        await finishElection(transaction, game.curElecId);
      }
      const newElec = await transaction.election.create({
        data: {
          game: {
            connect: { id: gameId },
          },
        },
      });
      /* fetch changes */
      game = await transaction.game.findUniqueOrThrow({
        where: { id: gameId },
        select: {
          name: true,
          curElecId: true,
          state: true,
          spiritChatRoomId: true,
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
      const state: StateGame =
        !game.players.some(
          player => player.state === StatePlayer.ALIVE && player.role === Role.WOLF
        ) ||
        !game.players.some(
          player => player.state === StatePlayer.ALIVE && player.role === Role.VILLAGER
        )
          ? StateGame.END
          : day
          ? StateGame.DAY
          : StateGame.NIGHT;
      await transaction.game.update({
        where: { id: gameId },
        data: {
          state,
          curElec: {
            connect: { id: newElec.id },
          },
        },
      });
      console.log(
        !game.players.some(
          player => player.state === StatePlayer.ALIVE && player.role === Role.WOLF
        ) ||
          !game.players.some(
            player => player.state === StatePlayer.ALIVE && player.role === Role.VILLAGER
          )
      );
      // vire l'invité de la spirit chat room
      if (game.spiritChatRoomId !== null && day) {
        const spiritId = game.spiritChatRoomId;
        const spiritChat = await transaction.chatRoom.findUnique({
          where: { id: spiritId },
          include: {
            writers: {
              select: {
                playerId: true,
                player: {
                  select: {
                    power: true,
                  },
                },
              },
            },
            readers: true,
          },
        });
        if (!spiritChat) throw new Error("Spirit chat not found");
        spiritChat?.writers
          .filter(writer => writer.player.power !== Power.SPIRIT)
          .map(writer => writer.playerId)
          .forEach(async playerId => {
            await transaction.writer.delete({
              where: {
                playerId_gameId_chatRoomId: {
                  playerId,
                  gameId,
                  chatRoomId: spiritId,
                },
              },
            });
            await transaction.reader.delete({
              where: {
                playerId_gameId_chatRoomId: {
                  playerId,
                  gameId,
                  chatRoomId: spiritId,
                },
              },
            });
          });
      }

      await transaction.player.updateMany({
        where: {
          gameId,
          power: { not: Power.NONE },
        },
        data: {
          usedPower: false,
        },
      });

      // on supprime le job si la game est fini
      if (state === StateGame.END) {
        await notificationService.endGame(transaction, game.players, game.name);
        deleteJob(gameId, JobType.NEW_NIGHT);
        deleteJob(gameId, JobType.NEW_DAY);
      } else {
        if (day) await notificationService.newDay(transaction, game.players, game.name);
        else await notificationService.newNight(transaction, game.players, game.name);
      }
    })
    .then(() => {
      console.log("New period created");
      return Promise.resolve();
    })
    .catch(error => {
      console.log(error);
    });
};

export default newPeriod;
