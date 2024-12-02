"use strict";

/** Routes for events. */

const express = require("express");
const router = new express.Router();
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} = require("../expressError");
const jsonschema = require("jsonschema");

const Event = require("../models/event");
const EventAttendee = require("../models/eventAttendee");
const EventFavorite = require("../models/eventFavorite");
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
    const event = await Event.create({
      title,
      description,
      date,
      location,
      createdBy: res.locals.user.id,
    });
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
    const event = await Event.get(req.params.id, res.locals.user.id);
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
 * 
// filters: 
- showFavorites (returns only the events which are in Favorites),
- showAttendingEvents (returns only the events which are in EventAttendees)
 **/
router.get("/", ensureLoggedIn, async function (req, res, next) {
  // filters for query
  const { showFavorites, showAttendingEvents } = req.query;

  try {
    // fetching all the events
    const events = await Event.getAll(res.locals.user.id, showFavorites, showAttendingEvents);

    return res.json({ data: events });
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
    const event = await Event.get(req.params.id, res.locals.user.id);

    if (!event) {
      throw new NotFoundError();
    }

    if (event.createdBy !== res.locals.user.id) {
      throw new UnauthorizedError();
    }

    const validator = jsonschema.validate(req.body, eventUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const updatedEvent = await Event.update(req.params.id, req.body);
    return res.json({ data: updatedEvent });
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
    const event = await Event.get(req.params.id, res.locals.user.id);

    if (event.createdBy?.toString() !== res.locals.user.id.toString()) {
      throw new UnauthorizedError();
    }

    await Event.delete(req.params.id);

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /[id]/attendance  Sign up for event with data
 *
 *  - Authorization required: logged in
 *
 *  * @returns { userId, eventId, createdAt }
 **/
router.post("/:id/attendance", ensureLoggedIn, async function (req, res, next) {
  try {
    const event = await Event.get(req.params.id, res.locals.user.id);

    if (!event) {
      throw new NotFoundError();
    }

    const attending = await EventAttendee.add(
      res.locals.user.id,
      req.params.id
    );
    return res.json({ data: attending });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /[id]/attendance  Cancel attendance from event
 *
 * - Authorization required: logged in
 *
 *
 **/
router.delete(
  "/:id/attendance",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const event = await Event.get(req.params.id, res.locals.user.id);

      if (!event) {
        throw new NotFoundError();
      }

      await EventAttendee.remove(res.locals.user.id, req.params.id);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * POST /[id]/favorite  Add event to favorites with data
 *
 *  - Authorization required: logged in
 *
 *  * @returns { userId, eventId, createdAt }
 **/
router.post("/:id/favorite", ensureLoggedIn, async function (req, res, next) {
  try {
    const event = await Event.get(req.params.id, res.locals.user.id);

    if (!event) {
      throw new NotFoundError();
    }

    const favorite = await EventFavorite.add(res.locals.user.id, req.params.id);
    return res.json({ data: favorite });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /[id]/favorite  Remove event from favorites
 *
 * - Authorization required: logged in
 *
 *
 **/
router.delete("/:id/favorite", ensureLoggedIn, async function (req, res, next) {
  try {
    const event = await Event.get(req.params.id, res.locals.user.id);

    if (!event) {
      throw new NotFoundError();
    }

    await EventFavorite.remove(res.locals.user.id, req.params.id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
