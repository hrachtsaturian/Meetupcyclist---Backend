const db = require("../../db");
const bcrypt = require("bcrypt");
const User = require("./user");
const { NotFoundError, BadRequestError, UnauthorizedError } = require("../expressError");

jest.mock("../db");
jest.mock("bcrypt");

describe("User model", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("authenticate", () => {
    it("should return user data if email and password are valid", async () => {
      const mockUser = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        bio: "This is a bio",
        pfpUrl: "https://example.com/pfp.jpg",
        password: "hashedPassword",
      };

      db.query.mockResolvedValue({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValue(true);

      const user = await User.authenticate("test@example.com", "password");

      expect(user).toEqual({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        bio: "This is a bio",
        pfpUrl: "https://example.com/pfp.jpg",
      });
      expect(bcrypt.compare).toHaveBeenCalledWith("password", "hashedPassword");
    });

    it("should throw UnauthorizedError if email is invalid", async () => {
      db.query.mockResolvedValue({ rows: [] });

      await expect(User.authenticate("wrong@example.com", "password")).rejects.toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError if password is incorrect", async () => {
      const mockUser = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        bio: "This is a bio",
        pfpUrl: "https://example.com/pfp.jpg",
        password: "hashedPassword",
      };

      db.query.mockResolvedValue({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValue(false);

      await expect(User.authenticate("test@example.com", "wrongpassword")).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("signup", () => {
    it("should sign up user and return user data", async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      bcrypt.hash.mockResolvedValue("hashedPassword");

      db.query.mockResolvedValueOnce({
        rows: [{
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          bio: "This is a bio",
          pfpUrl: "https://example.com/pfp.jpg",
        }],
      });

      const user = await User.signup({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "password",
        bio: "This is a bio",
        pfpUrl: "https://example.com/pfp.jpg",
      });

      expect(user).toEqual({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        bio: "This is a bio",
        pfpUrl: "https://example.com/pfp.jpg",
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("password", expect.any(Number));
    });

    it("should throw BadRequestError if email already exists", async () => {
      db.query.mockResolvedValueOnce({ rows: [{ email: "test@example.com" }] });

      await expect(User.signup({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "password",
        bio: "This is a bio",
        pfpUrl: "https://example.com/pfp.jpg",
      })).rejects.toThrow(BadRequestError);
    });
  });

  describe("get", () => {
    it("should return user data for a valid user ID", async () => {
      db.query.mockResolvedValue({
        rows: [{
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          bio: "This is a bio",
          pfpUrl: "https://example.com/pfp.jpg",
        }],
      });

      const user = await User.get(1);

      expect(user).toEqual({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        bio: "This is a bio",
        pfpUrl: "https://example.com/pfp.jpg",
      });
    });

    it("should throw NotFoundError if user is not found", async () => {
      db.query.mockResolvedValue({ rows: [] });

      await expect(User.get(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe("update", () => {
    it("should update user data and return updated user", async () => {
      const data = { firstName: "Updated" };
      const mockResult = {
        rows: [{
          firstName: "Updated",
          lastName: "User",
          email: "test@example.com",
          bio: "This is a bio",
          pfpUrl: "https://example.com/pfp.jpg",
        }],
      };

      db.query.mockResolvedValue(mockResult);

      const updatedUser = await User.update(1, data);

      expect(updatedUser).toEqual({
        firstName: "Updated",
        lastName: "User",
        email: "test@example.com",
        bio: "This is a bio",
        pfpUrl: "https://example.com/pfp.jpg",
      });
    });

    it("should throw NotFoundError if user is not found", async () => {
      db.query.mockResolvedValue({ rows: [] });

      await expect(User.update(999, { firstName: "Test" })).rejects.toThrow(NotFoundError);
    });
  });
});
