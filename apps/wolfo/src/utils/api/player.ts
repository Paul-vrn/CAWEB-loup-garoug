import { Player } from "types";
import api from "./api";

const playerApi = {
  getPlayers: async (gameId: number) => {
    const { data } = await api.get(`games/${gameId}/players`);
    return data;
  },
  getPlayer: async (gameId: number, userId: string): Promise<Player> => {
    const { data } = await api.get(`games/${gameId}/players/${userId}`);
    return data;
  },
  updatePlayer: async (player: Player) => {
    const { data } = await api.patch(`games/${player.gameId}/players/${player.userId}`, player);
    return data;
  },
};

export const { getPlayer, getPlayers, updatePlayer } = playerApi;
