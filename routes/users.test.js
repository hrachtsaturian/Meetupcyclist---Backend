const jwt = require("jsonwebtoken");
const request = require("supertest");
const { SECRET_KEY } = require("../config");
const app = require("../app");
const db = require("../db");

let userToken;
let userId;

describe("User Routes", () => {
  beforeAll(async () => {
    const userResponse = await request(app).post("/signup").send({
      email: "testuser@example.com",
      password: "testpassword",
      firstName: "Tommy",
      lastName: "Vercetti",
    });
    userToken = userResponse.body.data.token;
    userId = jwt.verify(userToken, SECRET_KEY).id;
  });

  afterAll(async () => {
    await db.query("ALTER TABLE users DISABLE TRIGGER ALL"); // Disable triggers
    await db.query("DELETE FROM users"); // Delete records
    await db.query("ALTER TABLE users ENABLE TRIGGER ALL"); // Re-enable triggers
    await db.end();
  });

  describe("GET /users/:id", () => {
    it("should return the user details", async () => {
      const res = await request(app)
        .get(`/users/${userId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(userId);
      expect(res.body.data.firstName).toBeDefined();
    });

    it("should return 404 if user does not exist", async () => {
      const res = await request(app)
        .get("/users/99999")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /users/:id", () => {
    it("should update user profile information", async () => {
      const res = await request(app)
        .patch(`/users/${userId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ firstName: "UpdatedName", bio: "Updated bio" });

      expect(res.status).toBe(200);
      expect(res.body.data.firstName).toBe("UpdatedName");
      expect(res.body.data.bio).toBe("Updated bio");
    });

    it("should return a 400 if invalid data is provided", async () => {
      const res = await request(app)
        .patch(`/users/${userId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ email: "invalid email" });

      expect(res.status).toBe(400);
    });

    it("should return 403 if the user tries to update another user's profile", async () => {
      const res = await request(app)
        .patch("/users/2")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ firstName: "UpdatedByOther" });

      expect(res.status).toBe(403);
    });
  });
});
