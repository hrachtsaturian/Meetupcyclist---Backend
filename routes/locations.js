"use strict";

/** Routes for locations. */

const express = require("express");
const router = new express.Router();
const {
  BadRequestError,
  // UnauthorizedError,
  NotFoundError,
} = require("../expressError");
const jsonschema = require("jsonschema");

const Location = require("../models/location");
const LocationFavorite = require("../models/locationFavorite");
const locationCreateSchema = require("../schemas/locationCreate.json");
const locationUpdateSchema = require("../schemas/locationUpdate.json");
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth");

/**
 * POST / :  { name, description, address } => { location }
 *
 *  - Authorization required: logged in and is admin
 *
 *  * @returns { id, name, description, address, createdBy, createdAt }
 **/
router.post(
  "/",
  ensureLoggedIn,
  ensureIsAdmin,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, locationCreateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const { name, description, address } = req.body;
      const location = await Location.create({
        name,
        description,
        address,
        createdBy: res.locals.user.id,
      });
      return res.json({ data: location });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * GET /[id] => { location }
 *
 * - Authorization required: logged in
 *
 * @returns { id, name, description, address, createdBy, createdAt }
 **/
router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const location = await Location.get(req.params.id, res.locals.user.id);
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
 * @returns { id, name, description, address, createdBy, createdAt }
  // filters: 
- showFavorites (returns only the groups which are in Favorites)
 **/
router.get("/", ensureLoggedIn, async function (req, res, next) {
  // filter for query
  const { showFavorites } = req.query;

  try {
    // fetching all the locations
    const locations = await Location.getAll(res.locals.user.id);

    // showFavorites filter
    let filteredLocations = locations;
    if (showFavorites === "true") {
      filteredLocations = locations.filter(
        (location) =>
          location.isFavorite === true && location.userId === res.locals.user.id
      );
    }

    return res.json({ data: filteredLocations });
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
 * - Authorization required: logged in and is admin
 *
 * @returns { id, name, description, address, createdBy, createdAt }
 *
 **/
router.patch(
  "/:id",
  ensureLoggedIn,
  ensureIsAdmin,
  async function (req, res, next) {
    try {
      const location = await Location.get(req.params.id, res.locals.user.id);

      if (!location) {
        throw new NotFoundError();
      }

      const validator = jsonschema.validate(req.body, locationUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const updatedLocation = await Location.update(req.params.id, req.body);
      return res.json({ data: updatedLocation });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * DELETE /[id] { location } => 204
 *
 * - Authorization required: logged in and is admin
 *
 *
 **/
router.delete(
  "/:id",
  ensureLoggedIn,
  ensureIsAdmin,
  async function (req, res, next) {
    try {
      await Location.delete(req.params.id);

      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * POST /[id]/favorite  Add location to favorites with data
 *
 *  - Authorization required: logged in
 *
 *  * @returns { userId, eventId, createdAt }
 **/
router.post("/:id/favorite", ensureLoggedIn, async function (req, res, next) {
  try {
    const location = await Location.get(req.params.id, res.locals.user.id);

    if (!location) {
      throw new NotFoundError();
    }

    const favorite = await LocationFavorite.add(
      res.locals.user.id,
      req.params.id
    );
    return res.json({ data: favorite });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /[id]/favorite  Remove location from favorites
 *
 * - Authorization required: logged in
 *
 *
 **/
router.delete("/:id/favorite", ensureLoggedIn, async function (req, res, next) {
  try {
    const location = await Location.get(req.params.id, res.locals.user.id);

    if (!location) {
      throw new NotFoundError();
    }

    await LocationFavorite.remove(res.locals.user.id, req.params.id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
