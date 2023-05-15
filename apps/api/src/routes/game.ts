import express from "express";
import gameController from "../controllers/game";
import checkGame from "../middleware/checkGame";
const router = express.Router({ mergeParams: true });

router.get("/", gameController.getAllNotJoinByState);
router.post("/", gameController.create);
router.get("/mygames", gameController.getMyGames);
router.post("/:id/join", gameController.join); // check le token
router.post("/:id/leave", gameController.leave); // check le token
router.get("/:id", checkGame, gameController.get); // access to the game only if you are in the players

export default router;
