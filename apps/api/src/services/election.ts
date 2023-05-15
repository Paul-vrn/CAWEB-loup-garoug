import { StatePlayer, TransactionType, Vote } from "database";
import notificationService from "./notification";

export const finishElection = async (transaction: TransactionType, electionId: number) => {
  const votes = await transaction.vote.findMany({
    where: { electionId },
  });
  const nbPlayers = (
    await transaction.player.findMany({
      where: { state: StatePlayer.ALIVE },
    })
  ).length;

  const voteArray: number[] = new Array(nbPlayers);
  let killedPlayerId = null;
  let nbVictims = 0;
  votes.forEach((vote: Vote) => {
    voteArray[+vote.targetId] += 1;
    if (voteArray[+vote.targetId] >= nbPlayers / 2) {
      killedPlayerId = vote.targetId;
      nbVictims++;
    }
  });
  const gameId = (await transaction.game.findUnique({
    where: { curElecId: electionId },
    select: {
      id: true,
    },
  }))!.id;
  if (!gameId) {
    throw Error;
  } else if (killedPlayerId !== null && nbVictims < 2) {
    await transaction.player.update({
      where: { userId_gameId: { userId: killedPlayerId, gameId } },
      data: {
        state: StatePlayer.DEAD,
      },
    });
    const game = await transaction.game.findUnique({
      where: { id: gameId },
      select: {
        name: true,
        dayChatRoomId: true,
        nightChatRoomId: true,
      },
    });
    if (!game) throw Error;
    notificationService.isDead(transaction, killedPlayerId, game.name);
    // vire le mort des chat rooms
    await transaction.chatRoom.update({
      where: { id: game.dayChatRoomId },
      data: {
        writers: {
          disconnect: {
            playerId_gameId_chatRoomId: {
              playerId: killedPlayerId,
              gameId,
              chatRoomId: game.dayChatRoomId,
            },
          },
        },
      },
    });
    await transaction.chatRoom.update({
      where: { id: game.nightChatRoomId },
      data: {
        writers: {
          disconnect: {
            playerId_gameId_chatRoomId: {
              playerId: killedPlayerId,
              gameId,
              chatRoomId: game.nightChatRoomId,
            },
          },
        },
      },
    });
  }
};
