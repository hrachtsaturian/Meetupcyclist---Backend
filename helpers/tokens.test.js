const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { createToken } = require("./tokens");

describe("createToken", () => {
  test("should return a valid JWT token with the correct payload", () => {
    const user = {
      id: 123,
      email: "test@example.com",
      isAdmin: false,
    };

    // Generate the token
    const token = createToken(user);

    // Decode the token to verify the payload
    const decoded = jwt.verify(token, SECRET_KEY);

    // Assertions
    expect(decoded).toMatchObject({
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  });

  test("should handle isAdmin flag correctly when true", () => {
    const user = {
      id: 456,
      email: "admin@example.com",
      isAdmin: true,
    };

    const token = createToken(user);

    const decoded = jwt.verify(token, SECRET_KEY);

    expect(decoded).toMatchObject({
      id: user.id,
      email: user.email,
      isAdmin: true,
    });
  });
});
