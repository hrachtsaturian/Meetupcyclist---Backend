const request = require("supertest");
const express = require("express");
const userRoutes = require("./users");
const { BadRequestError } = require("../expressError");
const User = require("../../models/user");

jest.mock("../models/user");
jest.mock("../middleware/auth", () => ({
  ensureLoggedIn: (req, res, next) => next(),
  ensureHasAccessToTheUser: (req, res, next) => next(),
}));

const app = express();
app.use(express.json());
app.use("/users", userRoutes);

describe("User Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /users/:id", () => {
    it("should return a user when given a valid ID", async () => {
      const mockUser = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        bio: "Just a test user",
        pfpUrl: "http://example.com/profile.jpg",
      };
      User.get.mockResolvedValue(mockUser);

      const response = await request(app).get("/users/1");

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ user: mockUser });
      expect(User.get).toHaveBeenCalledWith("1");
    });

    it("should return 404 error if user not found", async () => {
      User.get.mockRejectedValue(new Error("No user found"));

      const response = await request(app).get("/users/999");

      expect(response.statusCode).toBe(404);
      expect(response.body.error.message).toBe("No user found");
    });
  });

  describe("PATCH /users/:id", () => {
    const updatedData = {
      firstName: "Updated",
      lastName: "User",
      email: "updated@example.com",
      bio: "Updated bio",
      pfpUrl: "http://example.com/updated-profile.jpg",
    };

    it("should update a user and return updated data", async () => {
      User.update.mockResolvedValue(updatedData);

      const response = await request(app).patch("/users/1").send(updatedData);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ user: updatedData });
      expect(User.update).toHaveBeenCalledWith("1", updatedData);
    });

    it("should return 400 error if validation fails", async () => {
      const invalidData = { ...updatedData, email: "not-an-email" };

      const response = await request(app).patch("/users/1").send(invalidData);

      expect(response.statusCode).toBe(400);
      expect(response.body.error.message).toContain("instance.email is not of a type(s) string, format");
    });

    it("should return 404 error if user not found", async () => {
      User.update.mockRejectedValue(new Error("No user found"));

      const response = await request(app).patch("/users/999").send(updatedData);

      expect(response.statusCode).toBe(404);
      expect(response.body.error.message).toBe("No user found");
    });
  });

  describe("DELETE /users/:id", () => {
    it("should delete a user and return the deleted ID", async () => {
      User.remove.mockResolvedValue();

      const response = await request(app).delete("/users/1");

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ deleted: "1" });
      expect(User.remove).toHaveBeenCalledWith("1");
    });

    it("should return 404 error if user not found", async () => {
      User.remove.mockRejectedValue(new Error("No user found"));

      const response = await request(app).delete("/users/999");

      expect(response.statusCode).toBe(404);
      expect(response.body.error.message).toBe("No user found");
    });
  });
});
