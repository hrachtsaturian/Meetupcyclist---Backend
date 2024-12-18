"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError, ForbiddenError } = require("../expressError");
const User = require("../models/user");

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals
 *
 * It's not an error if no token was provided or if the token is not valid.
 */
async function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim(); // authorization: "Bearer {{jwt}}"
      res.locals.user = jwt.verify(token, SECRET_KEY);
      const user = await User.get(res.locals?.user?.id);

      // if user is deactivated then throw an error
      if (user?.deactivatedAt) {
        throw new UnauthorizedError("User is deactivated");
      }
    }

    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */
function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use access to specific user is needed.
 *
 * If not, raises Forbidden.
 */
function ensureHasAccessToTheUser(req, res, next) {
  try {
    const isTheSameUser = res.locals?.user?.id?.toString() === req.params?.id;
    if (!isTheSameUser) throw new ForbiddenError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when must be admin.
 *
 * If not, raises Forbidden.
 */
function ensureIsAdmin(req, res, next) {
  try {
    if (!res.locals?.user?.isAdmin) throw new ForbiddenError();
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureHasAccessToTheUser,
  ensureIsAdmin,
};
