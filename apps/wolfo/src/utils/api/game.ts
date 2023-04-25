import { Game, NewGame } from "types";
import api from "./api";

const gameApi = {
  getGamesLobby: async (): Promise<Game[]> => {
    const { data } = await api.get("/games?state=LOBBY");
    return data;
  },
  getMyGames: async (): Promise<Game[]> => {
    const { data } = await api.get("/games/mygames");
    return data;
  },
  getGame: async (id: number): Promise<Game> => {
    console.log("getGame", id);
    const { data } = await api.get(`/games/${id}`);
    return data;
  },
  createGame: async (game: NewGame) => {
    const { data } = await api.post("/games", game);
    return data;
  },
  deleteGame: async (id: number) => {
    const { data } = await api.delete(`/games/${id}`);
    return data;
  },
  updateGame: async (id: number, game: Game) => {
    const { data } = await api.put(`/games/${id}`, game);
    return data;
  },
  joinGame: async (id: number) => {
    const { data } = await api.post(`/games/${id}/join`);
    return data;
  },
  leaveGame: async (id: number) => {
    const { data } = await api.post(`/games/${id}/leave`);
    return data;
  },
  login: async (game: Game) => {
    const { data } = await api.post("/games/login", game);
    return data;
  },
};

export const {
  getGamesLobby,
  getMyGames,
  getGame,
  createGame,
  deleteGame,
  updateGame,
  joinGame,
  leaveGame,
  login,
} = gameApi;
