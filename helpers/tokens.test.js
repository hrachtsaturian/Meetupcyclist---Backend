const jwt = require("jsonwebtoken");
const { createToken } = require("./tokens");
const { SECRET_KEY } = require("../config");


// Mock the jwt.sign method
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

describe("createToken", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call jwt.sign with correct payload and secret key", () => {
    // Mock user data
    const user = { email: "test@example.com" };
    
    // Mock implementation of jwt.sign
    jwt.sign.mockImplementation(() => "mockedToken");

    // Call createToken
    const token = createToken(user);

    // Assertions
    expect(jwt.sign).toHaveBeenCalledWith({ email: user.email }, SECRET_KEY);
    expect(token).toBe("mockedToken");
  });

  it("should throw an error if user email is missing", () => {
    // Passing an empty user object
    const user = {};

    // Expect an error to be thrown
    expect(() => createToken(user)).toThrow();
  });
});
