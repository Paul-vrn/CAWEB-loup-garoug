import { Request, Response } from "express";
import prisma from "../prisma";
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;
import bcrypt from "bcrypt";
const userController = {
  async create(req: Request, res: Response) {
    const { name, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    try {
      const user = await prisma.user.create({
        data: {
          name,
          password: hashedPassword,
        },
      });
      // return l'user + son token avec status 201
      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
        },
        SECRET,
        { expiresIn: "7d" }
      );
      res.status(201).json({ token });
    } catch (error) {
      return res.status(400).json({ message: "Name already exists" });
    }
  },
  async getUsers(req: Request, res: Response) {
    const users = await prisma.user.findMany();
    res.json(users);
  },

  async auth(req: Request, res: Response) {
    const { name, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        name,
      },
    });
    if (!user) {
      return res.status(401).json({ message: "Name not found" });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Wrong password" });
    }
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
      },
      SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token });
  },
};

export default userController;
