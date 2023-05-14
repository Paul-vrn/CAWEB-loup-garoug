import { Player, Power, Role, StatePlayer, TransactionType } from "database";

const notificationService = {
  async newDay(transaction: TransactionType, players: Player[], gameName: string) {
    const notificationPromise = players.map(player => {
      return transaction.notification.create({
        data: {
          userId: player.userId,
          title: `Le jour se lève sur ${gameName}`,
          content: player.role === Role.WOLF ? "N'oubliez pas de vous voter" : "",
          link: "/games/" + player.gameId,
        },
      });
    });
    await Promise.all(notificationPromise);
  },
  async newNight(transaction: TransactionType, players: Player[], gameName: string) {
    const notificationPromise = players.map(player => {
      return transaction.notification.create({
        data: {
          userId: player.userId,
          title: `La nuit tombe sur ${gameName}`,
          content:
            player.power !== Power.NONE ? "N'oubliez pas d'utiliser votre pouvoir" : "Bonne nuit",
          link: "/games/" + player.gameId,
        },
      });
    });
    await Promise.all(notificationPromise);
  },
  async startGame(transaction: TransactionType, players: Player[], gameName: string) {
    const notificationPromise = players.map(player => {
      let content =
        `Vous êtes ${player.role}` +
        (player.power !== Power.NONE ? ` et vous avez le pouvoir ${player.power}` : "");
      return transaction.notification.create({
        data: {
          userId: player.userId,
          title: `La partie ${gameName} commence`,
          content,
          link: "/games/" + player.gameId,
        },
      });
    });
    await Promise.all(notificationPromise);
  },
  async gameDeleted(transaction: TransactionType, players: Player[], gameName: string) {
    const notificationPromise = players.map(player => {
      return transaction.notification.create({
        data: {
          userId: player.userId,
          title: `La partie ${gameName} a été supprimée`,
          content: "En raison d'un manquant de participants, la partie a été supprimée",
          link: "/",
        },
      });
    });
    await Promise.all(notificationPromise);
  },
  async endGame(transaction: TransactionType, players: Player[], gameName: string) {
    const lgWin =
      players.filter(player => player.state === StatePlayer.ALIVE && player.role === Role.WOLF)
        .length > 0;
    const notificationPromise = players.map(player => {
      return transaction.notification.create({
        data: {
          userId: player.userId,
          title: `La partie ${gameName} est terminée`,
          content: lgWin ? "Les loups ont gagné" : "Les villageois ont gagné",
          link: "/games/" + player.gameId,
        },
      });
    });
    await Promise.all(notificationPromise);
  },
};

export default notificationService;
