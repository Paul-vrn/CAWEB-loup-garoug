/* eslint-env jest */
import "jest";
import supertest from "supertest";
import app from "../../app";
const request = supertest(app);
let token: string = "";

beforeAll(async () => {
  const response = await request.post("/api/users/").set("Content-Type", "application/json").send({
    name: "userone",
    password: "userone",
  });
  console.log(JSON.stringify(response));
  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty("token");
  token = response.body.token;
});

describe("Scénario création de deux comptes avec meme nom", () => {
  describe("POST /api/users/ johnny", () => {
    test("Test account creation", async () => {
      const response = await request.post("/api/users/").send({ name: "johnny", password: "john" });
      console.log(JSON.stringify(response));
      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe("User created");
      expect(response.body).toHaveProperty("token");
      token = response.body.token;
    });
  });
  describe("GET /api/users/", () => {
    test("Test number of users", async () => {
      const response = await request
        .get("/api/users/")
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(2);
    });
  });
  describe("POST /api/users/ johndoe", () => {
    test("Test double account creation", async () => {
      const response = await request
        .post("/api/users/")
        .send({ name: "johnny", password: "johndoe" });
      console.log(JSON.stringify(response));
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Name already exists");
    });
  });
  test("now delete first account", async () => {
    const response = await request
      .delete("/api/users/")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("User Deleted");
  });
  test("Re-test number of users after delete", async () => {
    const response = await request
      .get("/api/users/")
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
  });
});

describe("GET /api/users/me", () => {
  test("Test get me from token", async () => {
    const response = await request
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");
    expect(response.statusCode).toBe(200);
  });
}); 

describe("Test scénario login -> update account", () => {
  describe("POST /api/users/login", () => {
    test("Test login", async () => {
      const response = await request
        .post("/api/users/login")
        .set("Content-Type", "application/json")
        .send({ name: "userone", password: "userone" });
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("User logged in");
      expect(response.body).toHaveProperty("token");
      token = response.body.token;
    });
  });
  describe("PATCH /api/users/", () => {
    test("Test update account", async () => {
      const response = await request
        .patch("/api/users/")
        .set("Authorization", `Bearer ${token}`)
        .set("Content-Type", "application/json")
        .send({ name: "userone", password: "userone2" });
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("User updated");
      expect(response.body).toHaveProperty("token");
      token = response.body.token;
    });
  });
});

describe("scénario création de compte -> update d'un autre compte avec meme nom", () => {
  describe("POST /api/users/ test", () => {
    test("Test account creation", async () => {
      const response = await request.post("/api/users/").send({ name: "test", password: "test" });
      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe("User created");
      expect(response.body).toHaveProperty("token");
    });
  });
  describe("POST /api/users/login", () => {
    test("Test login", async () => {
      const response = await request
        .post("/api/users/login")
        .set("Content-Type", "application/json")
        .send({ name: "userone", password: "userone2" });
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("User logged in");
      expect(response.body).toHaveProperty("token");
      token = response.body.token;
    });
  });
  describe("PATCH /api/users/", () => {
    test("Test update account with invalid name", async () => {
      const response = await request
        .patch("/api/users/")
        .set("Authorization", `Bearer ${token}`)
        .set("Content-Type", "application/json")
        .send({ name: "test", password: "userone2" });
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Name already exists");
    });
  });
  describe("delete /api/users/", () => {
    test("Now delete test user", async () => {
      token = (await request.post("/api/users/login").send({ name: "test", password: "test" })).body.token;
      const response = await request
      .delete("/api/users/")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("User Deleted");
    });
  });

});



describe("POST /api/users/login", () => {
  test("login wrong username", async () => {
    const response = await request
      .post("/api/users/login")
      .set("Content-Type", "application/json")
      .send({ name: "moustikman", password: "userone" });
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Name not found");
  });
});

describe("POST /api/users/login", () => {
  test("login wrong password", async () => {
    const response = await request
      .post("/api/users/login")
      .set("Content-Type", "application/json")
      .send({ name: "userone", password: "userone" });
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Wrong password");
  });
});

describe("POST /api/users/login", () => {
  test("We reset the token to the right one (userone)", async () => {
    const response = await request
      .post("/api/users/login")
      .set("Content-Type", "application/json")
      .send({ name: "userone", password: "userone2" });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("User logged in");
    expect(response.body).toHaveProperty("token");
    token = response.body.token;
  });
});

//describe("DELETE /api/users/", () => {
//  test("delete user not registered", async () => {
//    const response = await request
//      .delete("/api/users/")
//      .set("Authorization", `Bearer ${token}`)
//      .set("Content-Type", "application/json")
//    expect(response.statusCode).toBe(400);
//    expect(response.body.message).toBe("User does not exist in database");
//  });
//});


afterAll(async () => {
  const response = await request
    .delete("/api/users/")
    .set("Authorization", `Bearer ${token}`)
    .set("Content-Type", "application/json");
  expect(response.statusCode).toBe(200);
  expect(response.body.message).toBe("User Deleted");
});
