"use strict";

/** Routes for events. */

const express = require("express");
const router = new express.Router();
const { BadRequestError, UnauthorizedError } = require("../expressError");
const jsonschema = require("jsonschema");

const Event = require("../models/event");
const eventCreateSchema = require("../schemas/eventCreate.json");
const eventUpdateSchema = require("../schemas/eventUpdate.json");
const { ensureLoggedIn } = require("../middleware/auth");

/**
 * POST / :  { title, description, date, location } => { event }
 *
 *  - Authorization required: logged in
 *
 *  * @returns { id, title, description, date, location, createdBy, createdAt }
 **/
router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, eventCreateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const { title, description, date, location } = req.body;
    const event = await Event.create({ title, description, date, location, createdBy: res.locals.user.id });
    return res.json({ data: event });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /[id] => { event }
 *
 * - Authorization required: logged in
 *
 * @returns { id, title, description, date, location, createdBy, createdAt }
 **/
router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const event = await Event.get(req.params.id);
    return res.json({ data: event });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET / => [{ event }, ...]
 *
 * - Authorization required: logged in
 *
 * @returns { id, title, description, date, location, createdBy, createdAt }
 **/
router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const event = await Event.getAll();
    return res.json({ data: event });
  } catch (err) {
    return next(err);
  }
});

/**
 * PATCH /[id] { event } => { event }
 *
 * - Data can include:
 *   { title, description, date, location }
 *
 * - Authorization required: logged in
 *
 * @returns { id, title, description, date, location, createdBy }
 *
 **/
router.patch("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, eventUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const event = await Event.update(req.params.id, req.body);
    return res.json({ data: event });
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
    const event = await Event.get(req.params.id);

    if (event.createdBy?.toString() !== res.locals.user.id.toString()) {
      throw new UnauthorizedError();
    }

    await Event.delete(req.params.id);
  
    return res.status(204);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
