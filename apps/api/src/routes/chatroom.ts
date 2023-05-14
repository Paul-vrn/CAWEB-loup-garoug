import express from "express";
import chatroomController from "../controllers/chat";
import { checkReader } from "../middleware/checkChatroom";
const router = express.Router();

router.get("/:id/messages", checkReader, chatroomController.getTodayMessages);
router.get("/:id/history", chatroomController.getHistory);
router.get("/:id/readers", chatroomController.getReaders);
router.get("/:id/writers", chatroomController.getWriters);
router.get("/:id/permissions", chatroomController.getPermissions);
router.post("/:id/messages", chatroomController.sendMessage);
router.post("/:id/adduserdead", chatroomController.addDeadtoSpiritism);

export default router;
