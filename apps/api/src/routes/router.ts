import { Request, Response, Router } from "express";
import checkToken from "../middleware/checkToken";
import chatroom from "./chatroom";
import games from "./game";
import notification from "./notification";
import players from "./player";
import users from "./user";
import vote from "./vote";

const express = require("express");
const router: Router = express.Router();

router.use("/api/users", users);
router.use("/api/games", checkToken, games);
router.use("/api/chatrooms", checkToken, chatroom);
router.use("/api/games/:gameId/players", checkToken, players);
router.use("/api/notifications", checkToken, notification);
router.use("/api/games/:gameId/players/:id/elections", checkToken, vote);
router.use("*", (req: Request, res: Response) => {
  res.status(404).send("Endpoint not found");
});

export default router;
