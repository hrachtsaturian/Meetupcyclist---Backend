const request = require("supertest");
const express = require("express");
const authRoutes = require("./auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");

jest.mock("../models/user");
jest.mock("../helpers/tokens");

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

describe("Authentication Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /signup", () => {
    const newUser = {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "password123",
    };

    it("should sign up a user and return a token", async () => {
      User.signup.mockResolvedValue(newUser);
      createToken.mockReturnValue("mockToken");

      const response = await request(app)
        .post("/signup")
        .send(newUser);

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({ token: "mockToken" });
      expect(User.signup).toHaveBeenCalledWith(newUser);
      expect(createToken).toHaveBeenCalledWith(newUser);
    });

    it("should return 400 error if invalid data is provided", async () => {
      const invalidUser = { ...newUser, email: "invalidEmail" }; // Invalid email format

      const response = await request(app)
        .post("/signup")
        .send(invalidUser);

      expect(response.statusCode).toBe(400);
      expect(response.body.error.message).toContain("instance.email is not of a type(s) string, format");
    });

    it("should return 400 error if required fields are missing", async () => {
      const missingFieldsUser = { firstName: "Test", email: "test@example.com" }; // Missing lastName and password

      const response = await request(app)
        .post("/signup")
        .send(missingFieldsUser);

      expect(response.statusCode).toBe(400);
      expect(response.body.error.message).toContain("instance.lastName is required");
    });
  });

  describe("POST /login", () => {
    const credentials = {
      email: "test@example.com",
      password: "password123",
    };

    it("should authenticate a user and return a token", async () => {
      const mockUser = { email: "test@example.com" };
      User.authenticate.mockResolvedValue(mockUser);
      createToken.mockReturnValue("mockToken");

      const response = await request(app)
        .post("/login")
        .send(credentials);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ token: "mockToken" });
      expect(User.authenticate).toHaveBeenCalledWith("test@example.com", "password123");
      expect(createToken).toHaveBeenCalledWith(mockUser);
    });

    it("should return 400 error if invalid data is provided", async () => {
      const invalidCredentials = { email: "not-an-email", password: "password123" };

      const response = await request(app)
        .post("/login")
        .send(invalidCredentials);

      expect(response.statusCode).toBe(400);
      expect(response.body.error.message).toContain("instance.email is not of a type(s) string, format");
    });

    it("should return 401 error if authentication fails", async () => {
      User.authenticate.mockRejectedValue(new UnauthorizedError("Invalid email/password"));

      const response = await request(app)
        .post("/login")
        .send(credentials);

      expect(response.statusCode).toBe(401);
      expect(response.body.error.message).toBe("Invalid email/password");
    });
  });
});
