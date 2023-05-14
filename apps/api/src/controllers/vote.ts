import { Request, Response } from "express";
import { Player, Vote } from "types";
import prisma from "../prisma";
const voteController = {
  async get(req: Request, res: Response) {
    // #swagger.tags = ['Vote']
    // #swagger.summary = 'Get all votes from an election'
    // #swagger.security = [{'bearerAuth': [] }]
    const { id } = req.params;
    const electionId = +req.params.electionId;
    if (isNaN(electionId)) {
      // #swagger.responses[400] = { description: "Election ID must be a number", schema: { $message: "Election ID must be a number" } }
      return res.status(400).json({ message: "Election ID must be a number" });
    }

    prisma.vote
      .findUnique({ where: { voterId_electionId: { voterId: id, electionId } } })
      .then(vote => {
        if (vote === null) {
          // #swagger.responses[200] = { description: "Vote not found", schema: { $message: "Vote not found" } }
          return res.status(200).json({ message: "Vote not found" });
        }
        // #swagger.responses[200] = { description: "Vote found", schema: { $ref : '#/definitions/Vote', $message: "Vote found" }}
        return res.status(200).json({ vote, message: "Vote found" });
      })
      .catch(_ => {
        console.log(_);
        // #swagger.responses[400] = { description: "An error occurred", schema: { $message: "An error occurred" } }
        return res.status(400).json({ message: "An error occurred" });
      });
  },
  async create(req: Request, res: Response) {
    const { voterId, targetId, gameId }: Vote = req.body;
    const electionId = +req.params.electionId;
    if (voterId === targetId) {
      // #swagger.responses[400] = { description: "You can't vote for yourself!", schema: { $message: "You can't vote for yourself!" } }
      return res.status(400).json({ message: "You can't vote for yourself!" });
    }
    if (voterId !== req.params.id) {
      console.log(voterId);
      console.log(req.params.id);
      // #swagger.responses[400] = { description: "You can't vote in someone else's stead!", schema: { $message: "You can't vote in someone else's stead!" } }
      return res.status(400).json({ message: "You can't vote in someone else's stead!" });
    }
    if (isNaN(electionId)) {
      // #swagger.responses[400] = { description: "Election ID must be a number", schema: { $message: "Election ID must be a number" } }
      return res.status(400).json({ message: "Election ID must be a number" });
    }
    const data = {
      election: {
        connect: { id: electionId },
      },
      voters: {
        connect: { userId_gameId: { userId: voterId, gameId } },
      },
      targets: {
        connect: { userId_gameId: { userId: targetId, gameId } },
      },
    };

    return await prisma.vote
      .create({
        data,
      })
      .then(vote => {
        // #swagger.responses[201] = { description: "Vote created", schema: { $ref : '#/definitions/Vote', $message: "Vote created" }}
        res.status(201).json({ vote, message: "Vote created" });
      })
      //return l'user + son token avec status 201
      .catch(error => {
        console.log(error);
        if (error.code === "P2002" && error.meta.target.includes("voterId")) {
          console.log("Vote already exists");
          // #swagger.responses[400] = { description: "Vote already exists", schema: { $message: "Vote already exists" } }
          res.status(400).json({ message: "Vote already exists" });
        } else {
          // #swagger.responses[400] = { description: "An error occured", schema: { $message: "An error occured" } }
          res.status(400).json({ message: "An error occured" });
        }
      });
  },
  async getAll(req: Request, res: Response) {
    // #swagger.tags = ['Vote']
    // #swagger.summary = 'Get all votes from an election'
    // #swagger.security = [{'bearerAuth': [] }]
    const electionId = +req.params?.electionId;
    const players: Player[] = req.body;

    if (isNaN(electionId)) {
      res.status(400).json({ message: "Election ID must be a number" });
    }
    console.log("players" + players);
    return await Promise.all(
      Array.from(players).map(
        async p =>
          await prisma.vote.findMany({
            where: {
              targetId: p.userId,
            },
          })
      )
    )
      .then(votes => res.json({ votes, message: "Returning votes" }))
      .catch(e => {
        console.log(e);
        res.status(400).json({ message: "An error occured" });
      });
  },
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const electionId = +req.params?.electionId;
    const vote: Vote = req.body;

    if (isNaN(electionId)) {
      return res.status(400).json({ message: "Election ID must be a number" });
    }
    if (vote.voterId !== id) {
      return res.status(400).json({ message: "You can't vote in someone else's stead!" });
    }
    if (vote.voterId === vote.targetId) {
      return res.status(400).json({ message: "You can't vote for yourself!" });
    }
    prisma.vote
      .update({
        where: {
          voterId_electionId: { voterId: id, electionId: electionId },
        },
        data: {
          ...vote,
        },
      })
      .then(v => {
        res.json({ v, message: "Vote updated" });
      })
      .catch(error => {
        console.log(JSON.stringify(error));
        res.status(400).json({ message: "An error occured" });
      });
  },
  async deleteVote(req: Request, res: Response) {
    const { id } = req.params;
    const electionId = +req.params?.electionId;

    if (isNaN(electionId)) {
      return res.status(400).json({ message: "Election ID must be a number" });
    }

    prisma.vote
      .delete({
        where: {
          voterId_electionId: { voterId: id, electionId },
        },
      })
      .then(() => {
        res.json({ message: "Vote Deleted" });
      })
      .catch(error => {
        console.log(error);
        res.status(400).json({ message: "Vote does not exist in database" });
      });
  },
};

export default voteController;
