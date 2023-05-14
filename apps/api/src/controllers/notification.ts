import { Request, Response } from "express";
import prisma from "../prisma";
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;

const notificationController = {
  async getAll(req: Request, res: Response) {
    // #swagger.tags = ['Notification']
    // #swagger.summary = 'Get all notifications'
    // #swagger.security = [{'bearerAuth': [] }]
    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = jwt.verify(token, SECRET);
    const userId = decodedToken.id;
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
    });
    if (!notifications) {
      res.status(404).send("Notifications not found");
      return;
    }
    res.status(200).json(notifications);
  },
};

export default notificationController;
