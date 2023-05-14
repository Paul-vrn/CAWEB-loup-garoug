import express from "express";
import notificationController from "../controllers/notification";
const router = express.Router({ mergeParams: true });

router.get("/", notificationController.getAll);

export default router;
