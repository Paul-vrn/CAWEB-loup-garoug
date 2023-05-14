import { Player } from "database";
import { Request, Response } from "express";
import prisma from "../prisma";
const playerController = {
  getAll: async (req: Request, res: Response) => {
    // #swagger.tags = ['Player']
    // #swagger.summary = 'Get all players'
    // #swagger.security = [{'bearerAuth': [] }]
    const { gameId } = req.params;
    const players = await prisma.player.findMany({
      where: {
        gameId: Number(gameId),
      },
    });
    if (!players) {
      // #swagger.responses[404] = { description: 'Players not found' }
      res.status(404).send("Players not found");
      return;
    }
    console.log(players);
    // #swagger.responses[200] = { schema: { "$ref": "#/definitions/Player" } }
    res.status(200).json(players);
  },
  get: async (req: Request, res: Response) => {
    // #swagger.tags = ['Player']
    // #swagger.summary = 'Get player by id'
    // #swagger.security = [{'bearerAuth': [] }]
    const { id } = req.params;
    const { gameId } = req.params;
    const player = await prisma.player.findUnique({
      where: {
        userId_gameId: { userId: id, gameId: Number(gameId) },
      },
      select: {
        state: true,
        role: true,
        power: true,
        gameId: true,
        userId: true,
        usedPower: true,
        // user: {
        //   select: {
        //     id: true,
        //     name: true,
        //   },
        // },
      },
    });
    if (!player) {
      // #swagger.responses[404] = { description: 'Player not found' }
      res.status(404).send("Player not found");
      return;
    }
    // #swagger.responses[200] = { schema: { "$ref": "#/definitions/Player" } }
    res.status(200).json(player);
  },
  update: async (req: Request, res: Response) => {
    // #swagger.tags = ['Player']
    // #swagger.summary = 'Update player'
    // #swagger.security = [{'bearerAuth': [] }]
    const { id } = req.params;
    const { gameId } = req.params;
    const playerInfo: Player = { ...req.body };
    console.log("controller in update player");
    // delete playerInfo.user;
    const player = await prisma.player.update({
      where: {
        userId_gameId: { userId: id, gameId: Number(gameId) },
      },
      data: playerInfo,
    });
    // #swagger.responses[200] = { schema: { "$ref": "#/definitions/Player" } }
    res.status(200).json(player);
  },
};

export default playerController;
