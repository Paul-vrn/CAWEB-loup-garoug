const swaggerAutogen = require("swagger-autogen")({ language: "fr", openapi: "3.0.0" });
import { Player, Power, Role, StatePlayer } from "database";
import { Message, NewGame, NewUser } from "types";
import { BASE_URL, PROTOCOL } from "./env";
const outputFile = "swagger_output.json";
const endpointsFiles = ["src/routes/router.ts"];

const addGame: NewGame = {
  name: "Game X",
  state: "LOBBY",
  minPlayer: 5,
  maxPlayer: 20,
  wolfProb: 0.5,
  seerProb: 0.5,
  spiritProb: 0.5,
  contProb: 0.5,
  insomProb: 0.5,
  startDay: "2023-04-15T22:26:00+00:00",
  endDay: "2023-04-15T20:20:20+00:00",
  deadline: "2023-05-16T20:20:20+00:00",
};
const addUser: NewUser = {
  name: "Paul",
  password: "123456",
};

const message: Message = {
  id: 1,
  chatRoomId: 1,
  content: "blabla",
  authorId: "Paul",
  gameId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const player: Player = {
  userId: "1",
  gameId: 1,
  role: Role.VILLAGER,
  power: Power.NONE,
  state: StatePlayer.ALIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
  usedPower: false,
};

const addChatroom = {};
const doc = {
  info: {
    version: "1.0.0",
    title: "WOLFO API",
    description: "API for the application wolfo",
  },
  securityDefinitions: {
    /*bearerAuth: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      bearerFormat: "JWT",
    },*/
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
  host: BASE_URL, // change en fonction de l'environnement (local : localhost:3000, prod : scalingo.io)
  basePath: "/",
  schemes: [PROTOCOL], // en local http et en prod https (scalingo accepte que https)
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [
    {
      name: "User",
      description: "Everything about user and authentication",
    },
    {
      name: "Game",
      description: "Everything about game",
    },
    {
      name: "Chatroom",
      description: "Everything about chat",
    },
    {
      name: "Player",
      description: "Everything about player which refers to the link between user and game",
    },
    {
      name: "Vote",
      description: "Everything about vote",
    },
    {
      name: "Notification",
      description: "Everything about notification",
    },
  ],
  definitions: {
    addGame,
    Game: { ...addGame, id: 1 },
    addUser,
    User: { ...addUser, id: 1 },
    Message: message,
    addChatroom,
    Player: player,
  },
};

swaggerAutogen(outputFile, endpointsFiles, doc);
