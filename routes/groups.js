"use strict";

/** Routes for groups. */

const express = require("express");
const router = new express.Router();
const { BadRequestError, UnauthorizedError } = require("../expressError");
const jsonschema = require("jsonschema");

const Group = require("../models/group");
const groupCreateSchema = require("../schemas/groupCreate.json");
const groupUpdateSchema = require("../schemas/groupUpdate.json");
const { ensureLoggedIn } = require("../middleware/auth");

/**
 * POST / :  { name, description } => { group }
 *
 *  - Authorization required: logged in
 *
 *  * @returns { id, name, description, createdBy, createdAt }
 **/
router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, groupCreateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const { name, description } = req.body;
    const group = await Group.create({ name, description, createdBy: res.locals.user.id });
    return res.json({ data: group });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /[id] => { group }
 *
 * - Authorization required: logged in
 *
 * @returns { id, name, description, createdBy, createdAt }
 **/
router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const group = await Group.get(req.params.id);
    return res.json({ data: group });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET / => [{ group }, ...]
 *
 * - Authorization required: logged in
 *
 * @returns { id, name, description, createdBy, createdAt }
 **/
router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const group = await Group.getAll();
    return res.json({ data: group });
  } catch (err) {
    return next(err);
  }
});

/**
 * PATCH /[id] { group } => { group }
 *
 * - Data can include:
 *   { name, description }
 *
 * - Authorization required: logged in
 *
 * @returns { id, name, description, createdBy, createdAt }
 *
 **/
router.patch("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, groupUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const group = await Group.update(req.params.id, req.body);
    return res.json({ data: group });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /[id] { event } => 204
 *
 * - Authorization required: logged in, created by
 *
 *
 **/
router.delete("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const event = await Group.get(req.params.id);

    if (event.createdBy?.toString() !== res.locals.user.id.toString()) {
      throw new UnauthorizedError();
    }

    await Group.delete(req.params.id);
  
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
