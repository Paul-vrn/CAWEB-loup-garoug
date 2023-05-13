import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import prisma from "../prisma";
import { SECRET } from "../utils/env";
const jwt = require("jsonwebtoken");
const userController = {
  async create(req: Request, res: Response) {
    // #swagger.tags = ['User']
    // #swagger.summary = 'Create user'
    // #swagger.security = [{'bearerAuth': [] }]
    const { name, password } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
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
      // #swagger.responses[201] = { description: "User created", schema: { $message: "User created", $token: "token" } }
      res.status(201).json({ token, message: "User created" });
    } catch (error) {
      // #swagger.responses[400] = { description: "Name already exists", schema: { $message: "Name already exists" } }
      return res.status(400).json({ message: "Name already exists" });
    }
  },
  async getAll(req: Request, res: Response) {
    // #swagger.tags = ['User']
    // #swagger.summary = 'Create user'
    // #swagger.security = [{'bearerAuth': [] }]
    const users = await prisma.user.findMany();
    res.json(users);
  },
  async update(req: Request, res: Response) {
    // #swagger.tags = ['User']
    // #swagger.summary = 'Update user'
    // #swagger.security = [{'bearerAuth': [] }]
    // #swagger.parameters['user'] = { in: 'body', description:'Username', schema: { $ref : '#/definitions/addUser' }}
    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = jwt.verify(token, SECRET);
    const id = decodedToken.id;

    const { name, password } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    prisma.user
      .update({
        where: {
          id,
        },
        data: {
          name,
          password: hashedPassword,
        },
      })
      .then(user => {
        const newToken = jwt.sign(
          {
            id: user.id,
            name: user.name,
          },
          SECRET,
          { expiresIn: "7d" }
        );
        // #swagger.responses[200] = { description : "User updated", schema: { $token: "new token", $message: "User updated" } }
        res.json({ token: newToken, message: "User updated" });
      })
      .catch(error => {
        console.log(JSON.stringify(error));
        if (error.code === "P2002" && error.meta.target.includes("name")) {
          console.log("Name already exists");
          // #swagger.responses[400] = { description: "Name already exists", schema: { $message: "Name already exists" } }
          res.status(400).json({ message: "Name already exists" });
        } else {
          // #swagger.responses[400] = { description: "Unknown error", schema: { $message: "Unknown error" } }
          res.status(400).json({ message: "Unknown error" });
        }
      });
  },
  async auth(req: Request, res: Response) {
    // #swagger.tags = ['User']
    // #swagger.summary = 'Login'
    // #swagger.security = [{'bearerAuth': [] }]
    // #swagger.parameters['user'] = { in: 'body', description:'Username', schema: { $ref : '#/definitions/addUser' }}
    const { name, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        name,
      },
    });
    if (!user) {
      // #swagger.responses[401] = { description: "Name not found", schema: { $message: "Name not found" } }
      return res.status(401).json({ message: "Name not found" });
    }
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      // #swagger.responses[401] = { description: "Wrong password", schema: { $message: "Wrong password" } }
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
    // #swagger.responses[200] = { description: "User logged in", schema: { $token: "new token", $message: "User logged in" } }
    res.json({ token, message: "User logged in" });
  },
  async getFromToken(req: Request, res: Response) {
    // #swagger.tags = ['User']
    // #swagger.summary = 'Login from token'
    // #swagger.security = [{'bearerAuth': [] }]
    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = jwt.verify(token, SECRET);
    const id = decodedToken.id;
    prisma.user
      .findUnique({
        where: {
          id,
        },
      })
      .then(user => {
        // #swagger.responses[200] = { description: "User found", schema: { $ref : '#/definitions/User' }}
        res.json(user);
      })
      .catch(error => {
        console.log(error);
        // #swagger.responses[400] = { description: "User not found", schema: { $message: "User not found" } }
        res.status(400).json(error);
      });
  },
  async deleteUser(req: Request, res: Response) {
    // #swagger.tags = ['User']
    // #swagger.summary = 'delete himself'
    // #swagger.security = [{'bearerAuth': [] }]

    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = jwt.verify(token, SECRET);
    const id = decodedToken.id;
    prisma.user
      .delete({
        where: {
          id,
        },
      })
      .then(() => {
        // #swagger.responses[200] = { description: "User Deleted", schema: { $message: "User Deleted" } }
        res.json({ message: "User Deleted" });
      })
      .catch(error => {
        console.log(error);
        // #swagger.responses[400] = { description: "User does not exist in database", schema: { $message: "User does not exist in database" } }
        res.status(400).json({ message: "User does not exist in database" });
      });
  },
};

export default userController;
