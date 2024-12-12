"use strict";

/** Routes for locations. */

const express = require("express");
const router = new express.Router();
const {
  BadRequestError,
  NotFoundError,
} = require("../expressError");
const jsonschema = require("jsonschema");

const Location = require("../models/location");
const LocationSave = require("../models/locationSave");
const locationCreateSchema = require("../schemas/locationCreate.json");
const locationUpdateSchema = require("../schemas/locationUpdate.json");
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth");
const LocationReview = require("../models/locationReview");

/**
 * POST /   { name, description, address, pffUrl } => { location }
 *
 *  - Authorization required: logged in and is admin
 *
 *  * @returns { id, name, description, address, pfpUrl, createdBy, createdAt }
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

      const { name, description, address, pfpUrl } = req.body;
      const location = await Location.create({
        name,
        description,
        address,
        pfpUrl,
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
 * @returns { id, name, description, address, pfpUrl, createdBy, createdAt }
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
 * @returns { id, name, description, address, pfpUrl, createdBy, createdAt }
  // filters: 
- isSaved (returns only the groups which are in Saved)
 **/
router.get("/", ensureLoggedIn, async function (req, res, next) {
  // filter for query
  const { isSaved } = req.query;

  try {
    // fetching all the locations
    const locations = await Location.getAll({ userId: res.locals.user.id, isSaved });

    return res.json({ data: locations });
  } catch (err) {
    return next(err);
  }
});

/**
 * PATCH /[id] { location } => { location }
 *
 * - Data can include:
 *   { name, description, address, pfpUrl }
 *
 * - Authorization required: logged in and is admin
 *
 * @returns { id, name, description, address, pfpUrl, createdBy, createdAt }
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
 * POST /[id]/reviews  Make a review for a location
 *
 *  - Authorization required: logged in
 *
 *  * @returns { id, userId, locationId, text, rate, createdAt, updatedAt }
 **/
router.post("/:id/reviews", ensureLoggedIn, async function (req, res, next) {
  try {
    const location = await Location.get(req.params.id, res.locals.user.id);

    if (!location) {
      throw new NotFoundError();
    }

    const { text, rate } = req.body;

    const review = await LocationReview.create(
      res.locals.user.id,
      req.params.id,
      text,
      rate
    );
    return res.json({ data: review });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /[id]/reviews   =>  [{ review }, ...]
 *
 * - Authorization required: logged in
 *
 * @returns { id, userId, locationId, text, rate, createdAt, updatedAt }
 **/
router.get("/:id/reviews", ensureLoggedIn, async function (req, res, next) {
  try {
    const location = await Location.get(req.params.id, res.locals.user.id);

    if (!location) {
      throw new NotFoundError();
    }

    // fetching all the reviews
    const reviews = await LocationReview.getAll(req.params.id);

    return res.json({ data: reviews });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /[id]/saved  Add location to Saved with data
 *
 *  - Authorization required: logged in
 *
 *  * @returns { userId, eventId, createdAt }
 **/
router.post("/:id/saved", ensureLoggedIn, async function (req, res, next) {
  try {
    const location = await Location.get(req.params.id, res.locals.user.id);

    if (!location) {
      throw new NotFoundError();
    }

    const save = await LocationSave.add(
      res.locals.user.id,
      req.params.id
    );
    return res.json({ data: save });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /[id]/saved  Remove location from Saved
 *
 * - Authorization required: logged in
 *
 *
 **/
router.delete("/:id/saved", ensureLoggedIn, async function (req, res, next) {
  try {
    const location = await Location.get(req.params.id, res.locals.user.id);

    if (!location) {
      throw new NotFoundError();
    }

    await LocationSave.remove(res.locals.user.id, req.params.id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
