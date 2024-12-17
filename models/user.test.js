// const bcrypt = require("bcrypt");
const db = require("../db.js");
const User = require("./user");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

describe("User Model", () => {
  beforeEach(async () => {
    // Reset the database before each test
    await db.query("ALTER TABLE users DISABLE TRIGGER ALL"); // Disable triggers
    await db.query("DELETE FROM users"); // Delete records
    await db.query("ALTER TABLE users ENABLE TRIGGER ALL"); // Re-enable triggers
  });
  afterAll(async () => {
    // Cleanup database after all tests are run
    await db.end();
  });

  describe("signup", () => {
    it("should sign up a new user and return user data", async () => {
      const newUser = await User.signup({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        bio: "A motorcycle enthusiast",
        pfpUrl: "http://example.com/profile.jpg",
      });

      expect(newUser).toHaveProperty("id");
      expect(newUser).toHaveProperty("firstName", "John");
      expect(newUser).toHaveProperty("lastName", "Doe");
      expect(newUser).toHaveProperty("email", "john.doe@example.com");
      expect(newUser).toHaveProperty("bio", "A motorcycle enthusiast");
      expect(newUser).toHaveProperty(
        "pfpUrl",
        "http://example.com/profile.jpg"
      );
    });

    it("should throw BadRequestError for duplicate email", async () => {
      await User.signup({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        bio: "A motorcycle enthusiast",
        pfpUrl: "http://example.com/profile.jpg",
      });

      try {
        await User.signup({
          firstName: "Jane",
          lastName: "Doe",
          email: "john.doe@example.com", // Same email
          password: "password456",
          bio: "Another bio",
          pfpUrl: "http://example.com/jane.jpg",
        });
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestError);
      }
    });
  });

  describe("authenticate", () => {
    it("should authenticate a user with valid email and password", async () => {
      const newUser = await User.signup({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        bio: "A motorcycle enthusiast",
        pfpUrl: "http://example.com/profile.jpg",
      });

      const authenticatedUser = await User.authenticate(
        "john.doe@example.com",
        "password123"
      );

      expect(authenticatedUser).toEqual(
        expect.objectContaining({
          id: newUser.id,
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
        })
      );
    });

    it("shuld throw UnauthorizedError if invalid email", async () => {
      try {
        await User.authenticate("nonexistent@example.com", "password123");
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedError);
      }
    });
  });

  describe("get", () => {
    it("should return the user data by id", async () => {
      const newUser = await User.signup({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        bio: "A motorcycle enthusiast",
        pfpUrl: "http://example.com/profile.jpg",
      });

      const user = await User.get(newUser.id);

      expect(user).toEqual(
        expect.objectContaining({
          id: newUser.id,
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
        })
      );
    });

    it("should throw NotFoundError if user is not found", async () => {
      try {
        await User.get(9999); // Non-existent user ID
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundError);
      }
    });
  });

  describe("update", () => {
    it("should update user data successfully", async () => {
      const newUser = await User.signup({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        bio: "A motorcycle enthusiast",
        pfpUrl: "http://example.com/profile.jpg",
      });

      const updatedUser = await User.update(newUser.id, {
        firstName: "John Updated",
        lastName: "Doe Updated",
        bio: "Updated bio",
      });

      expect(updatedUser).toHaveProperty("firstName", "John Updated");
      expect(updatedUser).toHaveProperty("lastName", "Doe Updated");
      expect(updatedUser).toHaveProperty("bio", "Updated bio");
    });

    it("should throw NotFoundError if user not found for update", async () => {
      try {
        await User.update(9999, { firstName: "Nonexistent" });
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundError);
      }
    });
  });

  describe("deactivate", () => {
    it("should deactivate the user account", async () => {
      const newUser = await User.signup({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        bio: "A motorcycle enthusiast",
        pfpUrl: "http://example.com/profile.jpg",
      });

      const deactivatedUser = await User.update(newUser.id, {
        deactivatedAt: new Date(),
      });

      expect(deactivatedUser).toHaveProperty("deactivatedAt");
      expect(deactivatedUser.deactivatedAt).toBeTruthy();
    });
  });
});
