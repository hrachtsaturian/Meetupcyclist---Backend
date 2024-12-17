const request = require("supertest");
const app = require("../app");
const db = require("../db");

describe("Event Routes", () => {
  afterAll(async () => {
    await db.query("DELETE FROM events");
    await db.query("ALTER TABLE users DISABLE TRIGGER ALL"); // Disable triggers
    await db.query("DELETE FROM users"); // Delete records
    await db.query("ALTER TABLE users ENABLE TRIGGER ALL"); // Re-enable triggers
    await db.end();
  });
  describe("POST /", () => {
    afterEach(async () => {
      await db.query("DELETE FROM events");
    });

    test("works for logged-in users", async () => {
      const userRes = await request(app).post("/signup").send({
        email: "testuser1@example.com",
        password: "testpassword",
        firstName: "Tommy",
        lastName: "Vercetti",
      });
      const userToken = userRes.body.data;
      const resp = await request(app)
        .post("/events")
        .send({
          title: "Sample Event",
          description: "Event Description",
          date: "2024-12-15T15:00:00.000Z",
          location: "New York City",
          pfpUrl: "http://image.url/event.jpg",
        })
        .set("authorization", `Bearer ${userToken}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        data: expect.any(Object),
      });
    });

    test("fails for invalid input", async () => {
      const userRes = await request(app).post("/signup").send({
        email: "testuser2@example.com",
        password: "testpassword",
        firstName: "Tommy",
        lastName: "Vercetti",
      });
      const userToken = userRes.body.data;
      const resp = await request(app)
        .post("/events")
        .send({
          description: "Missing title field",
          date: "2024-12-15T15:00:00.000Z",
          location: "New York City",
          pfpUrl: "http://image.url/event.jpg",
        })
        .set("authorization", `Bearer ${userToken}`);

      expect(resp.statusCode).toEqual(400);
    });
  });

  describe("GET /", () => {
    test("works for logged-in users", async () => {
      const userRes = await request(app).post("/signup").send({
        email: "testuser3@example.com",
        password: "testpassword",
        firstName: "Tommy",
        lastName: "Vercetti",
      });
      const userToken = userRes.body.data;

      // event 1
      await request(app)
        .post("/events")
        .send({
          title: "Sample Event",
          description: "Event Description",
          date: "2034-12-15T15:00:00.000Z",
          location: "New York City",
          pfpUrl: "http://image.url/event.jpg",
        })
        .set("authorization", `Bearer ${userToken}`);

      // event 2
      await request(app)
        .post("/events")
        .send({
          title: "Sample Event",
          description: "Event Description",
          date: "2034-12-15T15:00:00.000Z",
          location: "New York City",
          pfpUrl: "http://image.url/event.jpg",
        })
        .set("authorization", `Bearer ${userToken}`);

      const resp = await request(app)
        .get("/events")
        .set("authorization", `Bearer ${userToken}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body.data).toHaveLength(2);
    });

    test("fails for unauthorized users", async () => {
      const resp = await request(app).get("/events");
      expect(resp.statusCode).toEqual(401);
    });
  });
});
