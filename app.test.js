const request = require("supertest");
const app = require("./app");
const db = require("./db");

afterAll(async () => {
  await db.end();
});

describe("GET /invalidRoute", () => {
  it("should return a 404 error for invalid routes", async () => {
    const res = await request(app).get("/invalidRoute");
    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe("Not Found");
  });
});

describe("GET /", () => {
  it("should return a 404 error on GET /", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe("Not Found");
  });
});

describe("POST /locations", () => {
  it("should return 403 Forbidden since the user is not an admin", async () => {
    const regularUserResponse = await request(app).post("/signup").send({
      email: "regularuser@example.com",
      password: "userpassword",
      firstName: "Tommy",
      lastName: "Vercetti",
    });
    const regularUserToken = regularUserResponse.body.data.token

    const res = await request(app)
      .post("/locations")
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send({
        name: "Cyclists Meetup Point",
        description: "A popular spot for cyclists",
        address: "123 Cyclist Street",
        pfpUrl: "http://example.com/cyclist.jpg",
      });

    expect(res.status).toBe(403);
  });
});

describe("CORS headers", () => {
  it("should include CORS headers", async () => {
    const res = await request(app).get("/users");

    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
    expect(res.headers["access-control-allow-methods"]).toBe("GET, POST, PUT, PATCH, DELETE, OPTIONS");
    expect(res.headers["access-control-allow-headers"]).toBe(
      "Content-Type, Authorization"
    );
  });
});
