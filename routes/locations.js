"use strict";

/** Routes for locations. */

const express = require("express");
const router = new express.Router();
const { BadRequestError, UnauthorizedError } = require("../expressError");
const jsonschema = require("jsonschema");

const Location = require("../models/location");
const locationCreateSchema = require("../schemas/locationCreate.json");
const locationUpdateSchema = require("../schemas/locationUpdate.json");
const { ensureLoggedIn } = require("../middleware/auth");


/**
 * POST / :  { name, description, address } => { location }
 *
 *  - Authorization required: logged in
 *
 *  * @returns { id, name, description, address, createdAt }
 **/
router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, locationCreateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const { name, description, address } = req.body;
    const location = await Location.create({name, description, address, createdBy: res.locals.user.id});
    return res.json({ data: location });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /[id] => { location }
 *
 * - Authorization required: logged in
 *
 * @returns { id, name, description, address, createdAt }
 **/
router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const location = await Location.get(req.params.id);
    return res.json({ data: location });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET / => [{ location }, ...]
 *
 * - Authorization required: logged in
 *
 * @returns { id, name, description, address, createdAt }
 **/
router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const location = await Location.getAll();
    return res.json({ data: location });
  } catch (err) {
    return next(err);
  }
});

/**
 * PATCH /[id] { location } => { location }
 *
 * - Data can include:
 *   { name, description, address }
 *
 * - Authorization required: logged in
 *
 * @returns { id, name, description, address, createdAt }
 *
 **/
router.patch("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, locationUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const location = await Location.update(req.params.id, req.body);
    return res.json({ data: location });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /[id] { location } => 204
 *
 * - Authorization required: logged in, created by
 *
 *
 **/
router.delete("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const location = await Location.get(req.params.id);

    if (location.createdBy?.toString() !== res.locals.user.id.toString()) {
      throw new UnauthorizedError();
    }

    await Location.delete(req.params.id);
  
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
