"use strict";

/** Routes for authentication. */

const express = require("express");
const router = new express.Router();
const { BadRequestError } = require("../expressError");
const { createToken } = require("../helpers/tokens");
const jsonschema = require("jsonschema");

const User = require("../models/user");
const userSignupSchema = require("../schemas/userSignup.json");
const userAuthSchema = require("../schemas/userAuth.json");

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
    return res.status(201).json({ token });
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
    return res.json({ data: token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
