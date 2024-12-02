"use strict";

/** Routes for users. */

const express = require("express");
const router = new express.Router();
const { BadRequestError } = require("../expressError");
const jsonschema = require("jsonschema");

const User = require("../models/user");
const userUpdateSchema = require("../schemas/userUpdate.json");
const {
  ensureLoggedIn,
  ensureHasAccessToTheUser,
} = require("../middleware/auth");

/**
 * GET /[id] => { user }
 *
 * - Authorization required: logged in
 *
 * @returns { id, firstName, lastName, email, bio, pfpUrl, isAdmin, createdAt }
 **/
router.get(
  "/:id",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const user = await User.get(req.params.id);
      return res.json({ data: user });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * GET / => [{ users}, ...]
 *
 * - Authorization required: logged in
 *
 * @returns { id, firstName, lastName, email, bio, pfpUrl, isAdmin, createdAt }
 **/
router.get(
  "/",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const users = await User.getAll();
      return res.json({ data: users });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * PATCH /[id] { user } => { user }
 *
 * - Data can include:
 *   { firstName, lastName, email, password, bio, pfpUrl }
 *
 * - Authorization required: logged in and same user
 *
 * @returns { id, firstName, lastName, email, bio, pfpUrl, isAdmin, createdAt }
 *
 **/
router.patch(
  "/:id",
  ensureLoggedIn,
  ensureHasAccessToTheUser,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, userUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const user = await User.update(req.params.id, req.body);
      return res.json({ data: user });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
