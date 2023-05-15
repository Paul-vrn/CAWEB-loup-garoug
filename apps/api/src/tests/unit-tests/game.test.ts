/* eslint-env jest */
import "jest";
import supertest from "supertest";
import app from "../../app";
const request = supertest(app);
let token: string = "";
let gameId: number = -1;

beforeAll(async () => {
  // first of all we create the user that will create the game
  const repCreation = await request
    .post("/api/users/")
    .set("Content-Type", "application/json")
    .send({
      name: "usertwo",
      password: "Mot2passe?",
    });
  expect(repCreation.status).toBe(201);
  expect(repCreation.body).toHaveProperty("token");
  const repLogin = await request
    .post("/api/users/login")
    .set("Content-Type", "application/json")
    .send({ name: "usertwo", password: "Mot2passe?" });
  expect(repLogin.statusCode).toBe(200);
  expect(repLogin.body.message).toBe("User logged in");
  expect(repLogin.body).toHaveProperty("token");
  token = repLogin.body.token;
  // now we create the other players
  await request.post("/api/users/").set("Content-Type", "application/json").send({
    name: "player1",
    password: "Mot2passe?",
  });

  await request.post("/api/users/").set("Content-Type", "application/json").send({
    name: "player2",
    password: "Mot2passe?",
  });

  await request.post("/api/users/").set("Content-Type", "application/json").send({
    name: "player3",
    password: "Mot2passe?",
  });

  await request.post("/api/users/").set("Content-Type", "application/json").send({
    name: "player4",
    password: "Mot2passe?",
  });
});

describe("Scénario création de partie -> ajout de joueurs -> lancement", () => {
  describe("POST /api/games/", () => {
    test("Test game creation", async () => {
      const response = await request
        .post("/api/games/")
        .set("Authorization", `Bearer ${token}`)
        .set("Content-Type", "application/json")
        .send({
          name: "game0",
          state: "LOBBY",
          minPlayer: 5,
          maxPlayer: 5,
          wolfProb: 0.2,
          seerProb: 0.2,
          insomProb: 0.5,
          contProb: 0.2,
          spiritProb: 1.0,
          startDay: "2023-04-15T08:00:00+00:00",
          endDay: "2023-04-15T20:00:00+00:00",
          deadline: "2024-04-25T00:00:00+00:00",
        });
      expect(response.statusCode).toBe(201);
      gameId = response.body.id;
    });
  });
  describe("connection des players", () => {
    test("multiple login and game join", async () => {
      let repLogin = await request
        .post("/api/users/login")
        .set("Content-Type", "application/json")
        .send({ name: "player1", password: "Mot2passe?" });
      expect(repLogin.statusCode).toBe(200);
      expect(repLogin.body.message).toBe("User logged in");
      expect(repLogin.body).toHaveProperty("token");
      token = repLogin.body.token;
      let repJoin = await request
        .post(`/api/games/${gameId}/join`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${token}`);
      expect(repJoin.statusCode).toBe(201);
      expect(repJoin.body.message).toBe("Game joined");

      repLogin = await request
        .post("/api/users/login")
        .set("Content-Type", "application/json")
        .send({ name: "player2", password: "Mot2passe?" });
      expect(repLogin.statusCode).toBe(200);
      expect(repLogin.body.message).toBe("User logged in");
      expect(repLogin.body).toHaveProperty("token");
      token = repLogin.body.token;
      repJoin = await request
        .post(`/api/games/${gameId}/join`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${token}`);
      expect(repJoin.statusCode).toBe(201);
      expect(repJoin.body.message).toBe("Game joined");

      repLogin = await request
        .post("/api/users/login")
        .set("Content-Type", "application/json")
        .send({ name: "player3", password: "Mot2passe?" });
      expect(repLogin.statusCode).toBe(200);
      expect(repLogin.body.message).toBe("User logged in");
      expect(repLogin.body).toHaveProperty("token");
      token = repLogin.body.token;
      repJoin = await request
        .post(`/api/games/${gameId}/join`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${token}`);
      expect(repJoin.statusCode).toBe(201);
      expect(repJoin.body.message).toBe("Game joined");

      repLogin = await request
        .post("/api/users/login")
        .set("Content-Type", "application/json")
        .send({ name: "player4", password: "Mot2passe?" });
      expect(repLogin.statusCode).toBe(200);
      expect(repLogin.body.message).toBe("User logged in");
      expect(repLogin.body).toHaveProperty("token");
      token = repLogin.body.token;
      repJoin = await request
        .post(`/api/games/${gameId}/join`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${token}`);
      expect(repJoin.statusCode).toBe(201);
      expect(repJoin.body.message).toBe("Game joined");

      // on remet le token de départ dans token
      repLogin = await request
        .post("/api/users/login")
        .set("Content-Type", "application/json")
        .send({ name: "usertwo", password: "Mot2passe?" });
      expect(repLogin.statusCode).toBe(200);
      expect(repLogin.body.message).toBe("User logged in");
      expect(repLogin.body).toHaveProperty("token");
      token = repLogin.body.token;
    });
  });
});

afterAll(async () => {
  let repDelete = await request
    .delete("/api/users/")
    .set("Authorization", `Bearer ${token}`)
    .set("Content-Type", "application/json");
  expect(repDelete.statusCode).toBe(200);
  expect(repDelete.body.message).toBe("User deleted");

  let repLogin = await request
    .post("/api/users/login")
    .set("Content-Type", "application/json")
    .send({ name: "player1", password: "Mot2passe?" });
  expect(repLogin.statusCode).toBe(200);
  expect(repLogin.body.message).toBe("User logged in");
  expect(repLogin.body).toHaveProperty("token");
  token = repLogin.body.token;
  repDelete = await request
    .delete("/api/users/")
    .set("Authorization", `Bearer ${token}`)
    .set("Content-Type", "application/json");
  expect(repDelete.statusCode).toBe(200);
  expect(repDelete.body.message).toBe("User deleted");

  repLogin = await request
    .post("/api/users/login")
    .set("Content-Type", "application/json")
    .send({ name: "player2", password: "Mot2passe?" });
  expect(repLogin.statusCode).toBe(200);
  expect(repLogin.body.message).toBe("User logged in");
  expect(repLogin.body).toHaveProperty("token");
  token = repLogin.body.token;
  repDelete = await request
    .delete("/api/users/")
    .set("Authorization", `Bearer ${token}`)
    .set("Content-Type", "application/json");
  expect(repDelete.statusCode).toBe(200);
  expect(repDelete.body.message).toBe("User deleted");

  repLogin = await request
    .post("/api/users/login")
    .set("Content-Type", "application/json")
    .send({ name: "player3", password: "Mot2passe?" });
  expect(repLogin.statusCode).toBe(200);
  expect(repLogin.body.message).toBe("User logged in");
  expect(repLogin.body).toHaveProperty("token");
  token = repLogin.body.token;
  repDelete = await request
    .delete("/api/users/")
    .set("Authorization", `Bearer ${token}`)
    .set("Content-Type", "application/json");
  expect(repDelete.statusCode).toBe(200);
  expect(repDelete.body.message).toBe("User deleted");

  repLogin = await request
    .post("/api/users/login")
    .set("Content-Type", "application/json")
    .send({ name: "player4", password: "Mot2passe?" });
  expect(repLogin.statusCode).toBe(200);
  expect(repLogin.body.message).toBe("User logged in");
  expect(repLogin.body).toHaveProperty("token");
  token = repLogin.body.token;
  repDelete = await request
    .delete("/api/users/")
    .set("Authorization", `Bearer ${token}`)
    .set("Content-Type", "application/json");
  expect(repDelete.statusCode).toBe(200);
  expect(repDelete.body.message).toBe("User deleted");
});
