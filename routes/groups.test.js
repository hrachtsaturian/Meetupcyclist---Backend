const request = require("supertest");
const app = require("../app");
const db = require("../db");

describe("Group Routes", () => {
  let userToken;
  let groupId;

  // Create a mock user (simulate a login and generate token)
  beforeAll(async () => {
    const res = await request(app).post("/signup").send({
      email: "testuser@example.com",
      password: "testpassword",
      firstName: "Tommy",
      lastName: "Vercetti",
    });

    userToken = res.body.data; // assuming JWT token is returned
  });

  afterAll(async () => {
    await db.query("ALTER TABLE users DISABLE TRIGGER ALL"); // Disable triggers
    await db.query("DELETE FROM users"); // Delete records
    await db.query("ALTER TABLE users ENABLE TRIGGER ALL"); // Re-enable triggers
    await db.end();
  });

  describe("POST /groups", () => {
    it("should create a group and return the group details", async () => {
      const res = await request(app)
        .post("/groups")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "Motorcycle Enthusiasts",
          description: "A group for all motorcycle lovers",
          pfpUrl: "https://example.com/pic.jpg",
        });
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.name).toBe("Motorcycle Enthusiasts");
      expect(res.body.data.createdBy).toBeDefined();
      groupId = res.body.data.id; // Save the group ID for other tests
    });

    it("should return a validation error if the group data is invalid", async () => {
      const res = await request(app)
        .post("/groups")
        .set("Authorization", `Bearer ${userToken}`)
        .send({}); // sending empty data

      expect(res.status).toBe(400);
    });
  });

  describe("GET /groups/:id", () => {
    it("should retrieve the group by ID", async () => {
      const res = await request(app)
        .get(`/groups/${groupId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(groupId);
      expect(res.body.data.name).toBe("Motorcycle Enthusiasts");
    });

    it("should return a not found error if the group does not exist", async () => {
      const res = await request(app)
        .get("/groups/999999")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /groups/:id", () => {
    it("should update the group details", async () => {
      const res = await request(app)
        .patch(`/groups/${groupId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "Advanced Motorcycle Lovers",
          description: "For advanced enthusiasts.",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Advanced Motorcycle Lovers");
    });

    it("should return an error if not the group creator tries to update", async () => {
      const anotherUserRes = await request(app).post("/signup").send({
        email: "testuser2@example.com",
        password: "testpassword",
        firstName: "Tommy",
        lastName: "Vercetti",
      });

      const anotherUserToken = anotherUserRes.body.data;
      const res = await request(app)
        .patch(`/groups/${groupId}`)
        .set("Authorization", `Bearer ${anotherUserToken}`)
        .send({
          name: "Another name update",
        });

      expect(res.status).toBe(401); // Unauthorized for other users
    });
  });

  describe("DELETE /groups/:id", () => {
    it("should delete the group if the user is the creator", async () => {
      const res = await request(app)
        .delete(`/groups/${groupId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(204);
    });

    it("should return a forbidden error if the user is not the creator", async () => {
      const anotherUserRes = await request(app).post("/signup").send({
        email: "testuser5@example.com",
        password: "testpassword",
        firstName: "Tommy",
        lastName: "Vercetti",
      });
      const anotherUserToken = anotherUserRes.body.data;
      const groupRes = await request(app)
        .post("/groups")
        .set("Authorization", `Bearer ${anotherUserToken}`)
        .send({
          name: "Motorcycle Enthusiasts",
          description: "A group for all motorcycle lovers",
          pfpUrl: "https://example.com/pic.jpg",
        });

      const res = await request(app)
        .delete(`/groups/${groupRes.body.data.id}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(401); // Unauthorized for other users
    });
  });

  describe("POST /groups/:id/membership", () => {
    it("should add the user to the group", async () => {
      const anotherUserRes = await request(app).post("/signup").send({
        email: "testuser3@example.com",
        password: "testpassword",
        firstName: "Tommy",
        lastName: "Vercetti",
      });
      const anotherUserToken = anotherUserRes.body.data;
      const groupRes = await request(app)
        .post("/groups")
        .set("Authorization", `Bearer ${anotherUserToken}`)
        .send({
          name: "Motorcycle Enthusiasts",
          description: "A group for all motorcycle lovers",
          pfpUrl: "https://example.com/pic.jpg",
        });
      const res = await request(app)
        .post(`/groups/${groupRes.body.data.id}/membership`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("userId");
      expect(res.body.data.userId).toBeDefined();
    });

    it("should return a not found error for non-existing groups", async () => {
      const res = await request(app)
        .post("/groups/999999/membership")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /groups/:id/membership", () => {
    it("should allow the user to leave the group", async () => {
      const anotherUserRes = await request(app).post("/signup").send({
        email: "testuser4@example.com",
        password: "testpassword",
        firstName: "Tommy",
        lastName: "Vercetti",
      });
      const anotherUserToken = anotherUserRes.body.data;
      const groupRes = await request(app)
        .post("/groups")
        .set("Authorization", `Bearer ${anotherUserToken}`)
        .send({
          name: "Motorcycle Enthusiasts",
          description: "A group for all motorcycle lovers",
          pfpUrl: "https://example.com/pic.jpg",
        });

      await request(app)
        .post(`/groups/${groupRes.body.data.id}/membership`)
        .set("Authorization", `Bearer ${userToken}`);

      const res = await request(app)
        .delete(`/groups/${groupRes.body.data.id}/membership`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(204);
    });
  });
});
