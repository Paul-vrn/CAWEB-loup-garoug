import { StateGame } from "database";
import { Request, Response } from "express";
import { NewGame } from "types";
import prisma from "../prisma";
import createGame from "../services/game/createGame";
import { JobType, deleteJob } from "../services/scheduler";
import { getTommorow } from "../services/time";
import { SECRET } from "../utils/env";
const jwt = require("jsonwebtoken");

const gameController = {
  async create(req: Request, res: Response) {
    // #swagger.tags = ['Game']
    // #swagger.summary = 'Create game'
    // #swagger.security = [{'bearerAuth': [] }]
    const game: NewGame = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = jwt.verify(token, SECRET);
    const userId = decodedToken.id;

    if (game.name.length > 130) {
      // #swagger.responses[400] = { description: "Name too long", schema: { $message: "Name too long" } }
      return res.status(400).json({ message: "Name too long" });
    }
    createGame(game, userId)
      .then(newGame => {
        // #swagger.responses[201] = { description: "Game created", schema: { $game: { $ref: "#/definitions/Game" } } }
        res.status(201).json(newGame);
      })
      .catch(error => {
        console.log(error);
        // #swagger.responses[400] = { description: "Error", schema: { $message: "Error" } }
        res.status(400).json(error);
      });
  },
  async get(req: Request, res: Response) {
    // #swagger.tags = ['Game']
    // #swagger.summary = 'Get game by id'
    // #swagger.security = [{'bearerAuth': [] }]
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    prisma.game
      .findUnique({
        where: {
          id,
        },
        include: {
          players: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })
      .then(game => {
        // #swagger.responses[200] = { description: "Game found", schema: { $game: { $ref: "#/definitions/Game" } } }
        res.json(game);
      })
      .catch(error => {
        console.log(error);
        // #swagger.responses[400] = { description: "Error", schema: { $message: "Error" } }
        res.status(400).json(error);
      });
  },
  async getAllNotJoinByState(req: Request, res: Response) {
    // #swagger.tags = ['Game']
    // #swagger.summary = 'Get all games not join by state'
    // #swagger.security = [{'bearerAuth': [] }]
    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = jwt.verify(token, SECRET);
    const userId = decodedToken.id;
    const state = req.query.state as StateGame;
    prisma.game
      .findMany({
        where: {
          NOT: {
            players: {
              some: {
                userId,
              },
            },
          },
          ...(state ? { state } : {}),
        },
        select: {
          id: true,
          name: true,
          state: true,
          deadline: true,
          startDay: true,
          maxPlayer: true,
          players: {
            select: {
              userId: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      })
      .then(games => {
        // #swagger.responses[200] = { description: "Games not joined", schema: { $games: [{ $ref: "#/definitions/Game" }] } }
        res.json(games);
      })
      .catch(error => {
        console.log(error);
        res.status(400).json(error);
      });
  },
  async getMyGames(req: Request, res: Response) {
    // #swagger.tags = ['Game']
    // #swagger.summary = 'Get all games that I join'
    // #swagger.security = [{'bearerAuth': [] }]
    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = jwt.verify(token, SECRET);
    const userId = decodedToken.id;
    prisma.game
      .findMany({
        where: {
          players: {
            some: {
              userId,
            },
          },
        },
        select: {
          id: true,
          name: true,
          state: true,
          deadline: true,
          startDay: true,
          endDay: true,
          maxPlayer: true,
          players: {
            select: {
              userId: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      })
      .then(games => {
        // #swagger.responses[200] = { description: "My games", schema: { $games: [{ $ref: "#/definitions/Game" }] } }
        res.json(games);
      })
      .catch(error => {
        console.log(error);
        // #swagger.responses[400] = { schema: { $message: "Error" } }
        res.status(400).json(error);
      });
  },
  async join(req: Request, res: Response) {
    // #swagger.tags = ['Game']
    // #swagger.summary = 'Join game'
    // #swagger.security = [{'bearerAuth': [] }]
    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = jwt.verify(token, SECRET);
    const userId = decodedToken.id;
    const gameId: number = parseInt(req.params.id, 10);
    if (isNaN(gameId)) {
      res.status(400).json({ error: "Invalid game id" });
      return;
    }
    prisma
      .$transaction(async transaction => {
        await transaction.player.create({
          data: {
            userId,
            gameId,
          },
        });
        const game = await transaction.game.findUniqueOrThrow({
          where: {
            id: gameId,
          },
          select: {
            maxPlayer: true,
            players: {
              select: {
                userId: true,
              },
            },
          },
        });
        if (!game) {
          throw new Error("Game not found");
        } else if (game.players.length === game.maxPlayer) {
          prisma.game.update({
            where: { id: gameId },
            data: { deadline: getTommorow() },
          });
        }
      })
      .then(player => {
        // #swagger.responses[201] = { description: "Game join", schema: { $message: "Game join", $player: { $ref: "#/definitions/Player" } } }
        res.status(201).json({ message: "Game joined", player });
      })
      .catch(error => {
        console.log(error);
        // #swagger.responses[400] = { schema: { $message: "Error" } }
        res.status(400).json(error);
      });
  },
  async leave(req: Request, res: Response) {
    // #swagger.tags = ['Game']
    // #swagger.summary = 'Leave game'
    // #swagger.security = [{'bearerAuth': [] }]
    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = jwt.verify(token, SECRET);
    const userId = decodedToken.id;
    const gameId: number = parseInt(req.params.id, 10);
    if (isNaN(gameId)) {
      res.status(400).json({ error: "Invalid game id" });
      return;
    }
    prisma.player
      .delete({
        where: {
          userId_gameId: {
            userId,
            gameId,
          },
        },
      })
      .then(player => {
        // #swagger.responses[201] = { description: "Game left", schema: { $message: "Game left", $player: { $ref: "#/definitions/Player" } } }
        res.status(201).json({ message: "Game left", player });
      })
      .catch(error => {
        console.log(error);
        // #swagger.responses[400] = { schema: { $message: "Error" } }
        res.status(400).json(error);
      });
  },
  start(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    prisma.game
      .update({
        where: { id },
        data: {
          state: StateGame.DAY,
        },
      })
      .then(gameUpdated => {
        deleteJob(gameUpdated.id, JobType.DEADLINE);
        res.status(201).json(gameUpdated);
      })
      .catch(error => {
        console.log(error);
        res.status(400).json(error);
      });
  },
};

export default gameController;
