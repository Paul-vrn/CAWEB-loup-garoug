import express from "express";
import voteController from "../controllers/vote";
const router = express.Router({ mergeParams: true });

router.get("/:electionId/", voteController.get);
router.post("/:electionId/all", voteController.getAll);
router.post("/:electionId/", voteController.create);
router.patch("/:electionId/", voteController.update);
router.delete("/:electionId/", voteController.deleteVote);
export default router;
