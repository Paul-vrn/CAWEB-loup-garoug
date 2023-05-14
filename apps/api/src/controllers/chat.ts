import { Power } from "database";
import { Request, Response } from "express";
import prisma from "../prisma";
import { SECRET } from "../utils/env";
const jwt = require("jsonwebtoken");

const chatroomController = {
  // add a writer and a reader to a chatroom
  async addDeadtoSpiritism(req: Request, res: Response) {
    // #swagger.tags = ['Chatroom']
    // #swagger.summary = 'Add a dead person to spiritism chatroom'
    // #swagger.security = [{'bearerAuth': [] }]
    // #swagger.parameters['chatroom'] = { in: 'body', schema: { $gameId: "gameId", $userDeadId: "userDeadId" }}
    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = jwt.verify(token, SECRET);
    const userSpiritId = decodedToken.id;
    const chatRoomId = Number(req.params.id);
    const gameId = Number(req.body.gameId);
    const userDeadId = String(req.body.userDeadId);

    if (isNaN(chatRoomId) || !userSpiritId || !gameId || !userDeadId) {
      // #swagger.responses[400] = { description: "Bad request, missing parameters", schema: { $message: "Bad request, missing parameters" } }
      res.status(400).send("Bad request, missing parameters");
      return;
    }
    const playerSpiritId = await prisma.player.findUnique({
      where: {
        userId_gameId: {
          userId: userSpiritId,
          gameId: gameId,
        },
      },
    });

    if (!playerSpiritId) {
      // #swagger.responses[400] = { description: "Bad request, player spirit id not found", schema: { $message: "Bad request, player spirit id not found" } }
      res.status(400).send("Bad request, player spirit id not found");
      return;
    }
    // Verify that player got spirit power and didn't use it yet
    if (playerSpiritId.power !== Power.SPIRIT || playerSpiritId.usedPower === true) {
      // #swagger.responses[400] = { description: "Bad request, no spirit power or already used", schema: { $message: "Bad request, no spirit power or already used" } }
      res.status(400).send("Bad request, no spirit power or already used");
      return;
    }

    const playerDeadId = await prisma.player.findUnique({
      where: {
        userId_gameId: {
          userId: userDeadId,
          gameId: gameId,
        },
      },
    });

    if (!playerDeadId) {
      // display player dead id
      res.status(400).send("Bad request, player dead id not found");
      return;
    }

    // Verify that player is dead
    if (playerDeadId.state === "ALIVE") {
      res.status(400).send("Bad request, player is not dead");
      return;
    }

    try {
      const chatroom = await prisma.chatRoom.update({
        where: {
          id: chatRoomId,
        },
        data: {
          readers: {
            upsert: {
              create: {
                playerId: userDeadId,
                gameId: gameId,
              },
              update: {},
              where: {
                playerId_gameId_chatRoomId: {
                  playerId: userDeadId,
                  gameId: gameId,
                  chatRoomId: chatRoomId,
                },
              },
            },
          },
          writers: {
            upsert: {
              create: {
                playerId: userDeadId,
                gameId: gameId,
              },
              update: {},
              where: {
                playerId_gameId_chatRoomId: {
                  playerId: userDeadId,
                  gameId: gameId,
                  chatRoomId: chatRoomId,
                },
              },
            },
          },
        },
      });
      // #swagger.responses[200] = { description: "Add user to chatroom", schema: { $chatroom: { $id: 1, $name: "chatroom name", $gameId: 1, $readers: [{ $playerId: "playerId", $gameId: 1 }], $writers: [{ $playerId: "playerId", $gameId: 1 }] } } }
      res.status(200).json(chatroom);
    } catch (error) {
      console.error("Failed to add user to chatroom:", error);
      // #swagger.responses[400] = { description: "Bad request, failed to add user to chatroom", schema: { $message: "Bad request, failed to add user to chatroom" } }
      res.status(400).json(error);
    }
  },

  getTodayMessages: async (req: Request, res: Response) => {
    // #swagger.tags = ['Chatroom']
    // #swagger.summary = 'Get today messages from chatroom'
    // #swagger.security = [{'bearerAuth': [] }]
    const chatRoomId = Number(req.params.id);
    if (isNaN(chatRoomId)) {
      // #swagger.responses[400] = { description: "Bad chatroom id", schema: { $message: "Bad chatroom id" } }
      res.status(400).send("Bad chatroom id");
      return;
    }
    const messages = await prisma.message.findMany({
      where: {
        AND: [
          {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)), // Début de la journée d'aujourd'hui
              lt: new Date(new Date().setHours(24, 0, 0, 0)), // Fin de la journée d'aujourd'hui
            },
          },
          {
            chatRoomId,
          },
        ],
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        authorId: true,
        author: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    // #swagger.responses[200] = { description: "Get today messages from chatroom", $data: [ { '$ref': '#/definitions/Message' } ] }
    res.status(200).json(messages);
  },

  async sendMessage(req: Request, res: Response) {
    const chatRoomId = Number(req.params.id);
    const { content, authorId, gameId } = req.body;

    if (isNaN(chatRoomId) || !content || !authorId || !gameId) {
      res.status(400).send("Bad request");
      return;
    }

    try {
      const newMessage = await prisma.message.create({
        data: {
          chatRoomId,
          content,
          authorId,
          gameId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Failed to send message:", error);
      res.status(500).json(error);
    }
  },

  getHistory: async (req: Request, res: Response) => {
    // #swagger.tags = ['Chatroom']
    // #swagger.summary = 'Get history'
    // #swagger.security = [{'bearerAuth': [] }]
    const chatRoomId = Number(req.params.id);
    if (isNaN(chatRoomId)) {
      res.status(400).send("Bad chatroom id");
      return;
    }
    const messages = await prisma.message.findMany({
      where: { chatRoomId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        authorId: true,
        author: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    // #swagger.responses[200] = { description: "Get history", $data: [ { '$ref': '#/definitions/Message' } ] }
    res.status(200).json(messages);
  },

  getReaders: async (req: Request, res: Response) => {
    // #swagger.tags = ['Chatroom']
    // #swagger.summary = 'Get readers'
    // #swagger.security = [{'bearerAuth': [] }]
    const chatRoomId = Number(req.params.id);
    if (isNaN(chatRoomId)) {
      res.status(400).send("Bad chatroom id");
      return;
    }
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      select: {
        readers: true,
      },
    });
    res.status(200).json(chatRoom?.readers);
  },

  getWriters: async (req: Request, res: Response) => {
    // #swagger.tags = ['Chatroom']
    // #swagger.summary = 'Get writers'
    // #swagger.security = [{'bearerAuth': [] }]
    const chatRoomId = Number(req.params.id);
    if (isNaN(chatRoomId)) {
      res.status(400).send("Bad chatroom id");
      return;
    }
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      select: {
        writers: true,
      },
    });
    res.status(200).json(chatRoom?.writers);
  },
  getPermissions: async (req: Request, res: Response) => {
    const chatRoomId = Number(req.params.id);
    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = jwt.verify(token, SECRET);
    const userId = decodedToken.id;
    if (isNaN(chatRoomId) || !userId) {
      res.status(400).send("Bad request");
      return;
    }
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        readers: true,
        writers: true,
      },
    });
    const writePermission = chatRoom?.writers.some(writer => writer.playerId === userId);
    const readPermission = chatRoom?.readers.some(reader => reader.playerId === userId);
    res.status(200).json({ write: writePermission, read: readPermission });
  },
};

export default chatroomController;
