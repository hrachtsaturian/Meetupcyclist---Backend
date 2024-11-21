const jwt = require("jsonwebtoken");
const { UnauthorizedError, ForbiddenError } = require("../expressError");
const { authenticateJWT, ensureLoggedIn, ensureHasAccessToTheUser } = require("./auth");

// Mock the jwt.verify function
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

describe("authenticateJWT", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = { locals: {} };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should verify token and set res.locals.user if token is valid", () => {
    const mockUser = { email: "test@example.com" };
    req.headers.authorization = "Bearer mockToken";
    jwt.verify.mockReturnValue(mockUser);

    authenticateJWT(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("mockToken", expect.any(String));
    expect(res.locals.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });

  it("should proceed without setting res.locals.user if no token is provided", () => {
    authenticateJWT(req, res, next);

    expect(jwt.verify).not.toHaveBeenCalled();
    expect(res.locals.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it("should proceed without setting res.locals.user if token is invalid", () => {
    req.headers.authorization = "Bearer invalidToken";
    jwt.verify.mockImplementation(() => { throw new Error("Invalid token"); });

    authenticateJWT(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(res.locals.user).toBeUndefined();
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe("ensureLoggedIn", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = { locals: {} };
    next = jest.fn();
  });

  it("should call next if user is logged in", () => {
    res.locals.user = { email: "test@example.com" };

    ensureLoggedIn(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it("should throw UnauthorizedError if user is not logged in", () => {
    ensureLoggedIn(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});

describe("ensureHasAccessToTheUser", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: { email: "test@example.com" } };
    res = { locals: { user: { email: "test@example.com" } } };
    next = jest.fn();
  });

  it("should call next if the user has access", () => {
    ensureHasAccessToTheUser(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it("should throw ForbiddenError if the user does not have access", () => {
    res.locals.user.email = "different@example.com";

    ensureHasAccessToTheUser(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });
});
