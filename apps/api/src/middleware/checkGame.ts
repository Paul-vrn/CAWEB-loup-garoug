import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
import { SECRET } from "../utils/env";
const jwt = require("jsonwebtoken");

export default function checkGame(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  const decodedToken = jwt.verify(token, SECRET);
  const userId = decodedToken.id;
  const gameId = req.params.id;
  // check if game.players.some(userId)
  const player = prisma.player.findUnique({
    where: {
      userId_gameId: {
        gameId: Number(gameId),
        userId,
      },
    },
  });
  if (!player) {
    res.status(401).json({ message: "Error. You are not in this game" });
  } else {
    return next();
  }
}
