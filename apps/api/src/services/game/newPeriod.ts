import { Power, Role, StateGame } from "database";
import prisma from "../../prisma";
import { finishElection } from "../election";
import notificationService from "../notification";
import { JobType, deleteJob } from "../scheduler";

const newPeriod = async (day: boolean, gameId: number) => {
  return await prisma
    .$transaction(async transaction => {
      const game = await transaction.game.findUniqueOrThrow({
        where: { id: gameId },
        select: {
          name: true,
          curElecId: true,
          state: true,
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
      const state: StateGame =
        !game.players.some(player => player.role === Role.WOLF) ||
        !game.players.some(player => player.role === Role.VILLAGER)
          ? StateGame.END
          : day
          ? StateGame.DAY
          : StateGame.NIGHT;
      await transaction.game.update({
        where: { id: gameId },
        data: {
          state,
          curElecId: newElec.id,
        },
      });
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
