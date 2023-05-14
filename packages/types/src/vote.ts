export type Vote = {
  voterId: string;
  targetId: string;
  gameId: number;
  electionId: number;
  createdAt?: Date;
  updatedAt?: Date;
};
