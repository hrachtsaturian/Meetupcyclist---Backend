const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** Return signed JWT from user data. */

function createToken(user) {
  let payload = {
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
  };

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
