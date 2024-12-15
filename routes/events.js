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
const EventPost = require("../models/eventPost");
const EventSave = require("../models/eventSave");
const eventCreateSchema = require("../schemas/eventCreate.json");
const eventUpdateSchema = require("../schemas/eventUpdate.json");
const { ensureLoggedIn } = require("../middleware/auth");

/**
 * POST /   { title, description, date, location, pfpUrl } => { event }
 *
 *  - Authorization required: logged in
 *
 *  * @returns { id, title, description, date, location, pfpUrl, createdBy, createdAt }
 **/
router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, eventCreateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const { title, description, date, location, pfpUrl } = req.body;
    const event = await Event.create({
      title,
      description,
      date,
      location,
      pfpUrl,
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
 * @returns { id, title, description, date, location, pfpUrl, createdBy, createdAt }
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
 * @returns { id, title, description, date, location, pfpUrl, createdBy, createdAt }
 * 
   // filters: 
   - isSaved (returns only the events which are in Saved),
   - isAttending (returns only the events which were in EventAttendees and upcoming)
   - minDate (additional query to show upcoming events only)
   - maxDate (additional query to show events which already passed)
   - createdBy (returns only the events which were created by specific user)
  
   - sort query to sort events 
 **/
router.get("/", ensureLoggedIn, async function (req, res, next) {
  // filters for query
  // query params are currently not parse and all returned as strings
  const { filter: { isSaved, isAttending, minDate, maxDate, createdBy } = {} } = req.query;
  const filter = {
    isSaved: isSaved === "true", // currently only supports true
    isAttending: isAttending === "true", // currently only supports true
    // ensure the date is valid date string
    minDate: !isNaN(Date.parse(minDate)) ? new Date(minDate) : null,
    // ensure the date is valid date string
    maxDate: !isNaN(Date.parse(maxDate)) ? new Date(maxDate) : null,
    createdBy,
  }

  const sort = {
    // default date sort is ASC
    // other sorts are not supported at the moment
    date: req.query?.sort?.date === 'DESC' ? 'DESC' : 'ASC'
  }

  try {
    // fetching all the events
    const events = await Event.getAll({
      userId: res.locals.user.id,
      filter,
      sort
    });

    return res.json({ data: events });
  } catch (err) {
    return next(err);
  }
});

/**
 * PATCH /[id] { event } => { event }
 *
 * - Data can include:
 *   { title, description, date, location, pfpUrl }
 *
 * - Authorization required: logged in, createdBy
 *
 * @returns { id, title, description, date, location, pfpUrl, createdBy }
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

    const isEventOrganizer = event.createdBy?.toString() === res.locals.user.id.toString();
    const isAdmin = res.locals.user.isAdmin;

    if (isEventOrganizer || isAdmin) {
      await Event.delete(req.params.id);
      return res.status(204).send();
    }

    throw new UnauthorizedError();
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
 * GET /[id]/attendees  Get attendees of a single event
 *
 *  - Authorization required: logged in
 *
 **/
router.get("/:id/attendees", ensureLoggedIn, async function (req, res, next) {
  try {
    const { id } = req.params;

    const event = await Event.get(id, res.locals.user.id);

    if (!event) {
      throw new NotFoundError();
    }
    const eventAttendees = await EventAttendee.get(id, res.locals.user.id);

    return res.json({ data: eventAttendees });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /[id]/posts  Make a post for an event
 *
 *  - Authorization required: logged in
 *
 *  * @returns { id, userId, eventId, text, createdAt, updatedAt }
 **/
router.post("/:id/posts", ensureLoggedIn, async function (req, res, next) {
  try {
    const event = await Event.get(req.params.id, res.locals.user.id);

    if (!event) {
      throw new NotFoundError();
    }

    const { text } = req.body;

    const post = await EventPost.create(
      res.locals.user.id,
      req.params.id,
      text
    );
    return res.json({ data: post });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /[id]/posts   =>  [{ post }, ...]
 *
 * - Authorization required: logged in
 *
 * @returns { id, userId, eventId, text, createdAt, updatedAt }
 **/
router.get("/:id/posts", ensureLoggedIn, async function (req, res, next) {
  try {
    const event = await Event.get(req.params.id, res.locals.user.id);

    if (!event) {
      throw new NotFoundError();
    }

    // fetching all the posts
    const posts = await EventPost.getAll(req.params.id);

    return res.json({ data: posts });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /[id]/saved  Add event to Saved with data
 *
 *  - Authorization required: logged in
 *
 *  * @returns { userId, eventId, createdAt }
 **/
router.post("/:id/saved", ensureLoggedIn, async function (req, res, next) {
  try {
    const event = await Event.get(req.params.id, res.locals.user.id);

    if (!event) {
      throw new NotFoundError();
    }

    const save = await EventSave.add(res.locals.user.id, req.params.id);
    return res.json({ data: save });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /[id]/saved  Remove event from Saved
 *
 * - Authorization required: logged in
 *
 *
 **/
router.delete("/:id/saved", ensureLoggedIn, async function (req, res, next) {
  try {
    const event = await Event.get(req.params.id, res.locals.user.id);

    if (!event) {
      throw new NotFoundError();
    }

    await EventSave.remove(res.locals.user.id, req.params.id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
