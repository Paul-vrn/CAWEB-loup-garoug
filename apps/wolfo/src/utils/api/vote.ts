import { Player, Vote } from "types";
import api from "./api";

const voteApi = {
  getVotes: async (players: Player[], player: Player, electionId: Number) => {
    const { data } = await api.post(
      `/games/${player.gameId}/players/${player.userId}/elections/${electionId}/all`,
      players
    );
    return data?.votes ? data.votes : null;
  },
  getVote: async (player: Player, electionId: Number) => {
    const { data } = await api.get(
      `/games/${player.gameId}/players/${player.userId}/elections/${electionId}`
    );
    return data?.vote ? data.vote : null;
  },
  createVote: async (player: Player, electionId: Number, vote: Vote) => {
    const { data } = await api.post(
      `/games/${player.gameId}/players/${player.userId}/elections/${electionId}`,
      vote
    );
    return data?.vote;
  },
  updateVote: async (player: Player, electionId: Number, vote: Vote) => {
    const { data } = await api.patch(
      `/games/${player.gameId}/players/${player.userId}/elections/${electionId}`,
      vote
    );
    return data?.vote;
  },
  deleteVote: async (player: Player, electionId: Number) => {
    await api.delete(`/games/${player.gameId}/players/${player.userId}/elections/${electionId}`);
  },
};

export default voteApi;
