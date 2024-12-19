"use strict";

/** Routes for authentication. */

const express = require("express");
const jwt = require("jsonwebtoken");
const router = new express.Router();
const { BadRequestError } = require("../expressError");
const { createToken } = require("../helpers/tokens");
const jsonschema = require("jsonschema");

const User = require("../models/user");
const userSignupSchema = require("../schemas/userSignup.json");
const userAuthSchema = require("../schemas/userAuth.json");
const { SECRET_KEY } = require("../config");

/**
 * POST /signup :   { user } => { token }
 *
 * - User must include:
 *   { firstName, lastName, email, password }
 *
 * - Authorization required: none
 *
 * Returns JWT token which can be used to authenticate further requests.
 **/
router.post("/signup", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userSignupSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const newUser = await User.signup({ ...req.body });
    const token = createToken(newUser);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(201).json({ data: { user: newUser, token } });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /login :  { email, password } => { token }
 *
 *  - Authorization required: none
 *
 * Returns JWT token which can be used to authenticate further requests.
 **/
router.post("/login", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userAuthSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const { email, password } = req.body;
    const user = await User.authenticate(email, password);
    const token = createToken(user);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.json({ data: { user, token } });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /authenticate :  { token } => { user }
 * 
 *  - Authorization required: none
 *  - This route is used when first launching the app
 *    to check if the user is logged in (has jwt cookie)
 *    and if so, return the user object and JWT token
 * 
 *  - Frontend will use this JWT token to make authenticated requests
 *    to the API using the Authorization header
 * 
 * Returns user object and JWT token
 */
router.post("/authenticate", async function (req, res, next) {
  try {
    const jwtCookie = req.cookies?.jwt;
    if (!jwtCookie) {
      // redirect home if no cookie (not logged in)
      return res.status(200).json({ redirect: "/" });
    }
    const parsedJwt = jwt.verify(jwtCookie, SECRET_KEY);
    const user = await User.get(parsedJwt.id);

    if (user.deactivatedAt) {
      // redirect home if user got deactivated but still has cookie
      throw new BadRequestError("User is deactivated");
    }

    return res.json({ data: { user, token: jwtCookie } });
  } catch (err) {
    // log error for debugging purposes
    // redirect home if anything goes wrong
    console.log('API Error:', err);
    return res.status(200).json({ redirect: "/" });
  }
});

router.post("/logout", async function (req, res, next) {
  try {
    // when user logs out, delete cookie
    // and then redirect user to the home page
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json({ redirect: "/" });
  } catch (err) {
    // redirect anyways if anything goes wrong
    return res.status(200).json({ redirect: "/" });
  }
});

module.exports = router;
