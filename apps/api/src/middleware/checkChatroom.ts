import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
import { SECRET } from "../utils/env";
const jwt = require("jsonwebtoken");

export function checkReader(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  const decodedToken = jwt.verify(token, SECRET);
  const userId = decodedToken.id;
  const chatRoomId = req.params.id;
  // check if game.players.some(userId)
  const reader = prisma.chatRoom.findUnique({
    where: {
      id: Number(chatRoomId),
    },
    include: {
      readers: {
        where: {
          playerId: userId,
        },
      },
    },
  });
  if (!reader) {
    res.status(401).json({ message: "Error. You are not in this game" });
  } else {
    return next();
  }
}

export function checkWriter(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  const decodedToken = jwt.verify(token, SECRET);
  const userId = decodedToken.id;
  const chatRoomId = req.params.id;
  // check if game.players.some(userId)
  const writer = prisma.chatRoom.findUnique({
    where: {
      id: Number(chatRoomId),
    },
    include: {
      writers: {
        where: {
          playerId: userId,
        },
      },
    },
  });
  if (!writer) {
    res.status(401).json({ message: "Error. You are not in this game" });
  } else {
    return next();
  }
}
