const jwt = require("jsonwebtoken");
const db = require("../db");
const { UnauthorizedError, ForbiddenError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureHasAccessToTheUser,
  ensureIsAdmin,
} = require("./auth");
const { SECRET_KEY } = require("../config");

const User = require("../models/user");

jest.mock("../models/user", () => ({
  get: jest.fn(),
}));

describe("Middleware tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await db.end();
  });

  describe("authenticateJWT", () => {
    test("throws UnauthorizedError if user is deactivated", async () => {
      const user = { id: 1, email: "testuser@example.com", isAdmin: false };
      const token = jwt.sign(user, SECRET_KEY);

      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = { locals: {} };
      const next = jest.fn();

      User.get.mockResolvedValueOnce({ ...user, deactivatedAt: new Date() });

      await authenticateJWT(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    test("does nothing if no authorization header is provided", async () => {
      const req = { headers: {} };
      const res = { locals: {} };
      const next = jest.fn();

      await authenticateJWT(req, res, next);

      expect(res.locals.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    test("does nothing if token is invalid", async () => {
      const req = { headers: { authorization: "Bearer invalid-token" } };
      const res = { locals: {} };
      const next = jest.fn();

      await authenticateJWT(req, res, next);

      expect(res.locals.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("ensureLoggedIn", () => {
    test("passes if user is logged in", () => {
      const req = {};
      const res = { locals: { user: { id: 1 } } };
      const next = jest.fn();

      ensureLoggedIn(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test("throws UnauthorizedError if user is not logged in", () => {
      const req = {};
      const res = { locals: {} };
      const next = jest.fn();

      ensureLoggedIn(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe("ensureHasAccessToTheUser", () => {
    test("passes if the user is accessing their own data", () => {
      const req = { params: { id: "1" } };
      const res = { locals: { user: { id: 1 } } };
      const next = jest.fn();

      ensureHasAccessToTheUser(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test("throws ForbiddenError if accessing someone else's data", () => {
      const req = { params: { id: "2" } };
      const res = { locals: { user: { id: 1 } } };
      const next = jest.fn();

      ensureHasAccessToTheUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });

  describe("ensureIsAdmin", () => {
    test("passes if user is admin", () => {
      const req = {};
      const res = { locals: { user: { isAdmin: true } } };
      const next = jest.fn();

      ensureIsAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test("throws ForbiddenError if user is not admin", () => {
      const req = {};
      const res = { locals: { user: { isAdmin: false } } };
      const next = jest.fn();

      ensureIsAdmin(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });
});
