"use strict";

/** Routes for groups. */

const express = require("express");
const router = new express.Router();
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} = require("../expressError");
const jsonschema = require("jsonschema");

const Group = require("../models/group");
const GroupMember = require("../models/groupMember");
const GroupEvent = require("../models/groupEvent");
const GroupPost = require("../models/groupPost");
const GroupSave = require("../models/groupSave");
const Event = require("../models/event");
const groupCreateSchema = require("../schemas/groupCreate.json");
const groupUpdateSchema = require("../schemas/groupUpdate.json");
const { ensureLoggedIn } = require("../middleware/auth");

/**
 * POST /   { name, description, pfpUrl } => { group }
 *
 *  - Authorization required: logged in
 *
 *  * @returns { id, name, description, pfpUrl, createdBy, createdAt }
 **/
router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, groupCreateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const { name, description, pfpUrl } = req.body;
    const group = await Group.create({
      name,
      description,
      pfpUrl,
      createdBy: res.locals.user.id,
    });

    // the creator (group admin) is added as a member
    await GroupMember.add(res.locals.user.id, group.id);

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
 * @returns { id, name, description, pfpUrl, createdBy, createdAt }
 **/
router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const group = await Group.get(req.params.id, res.locals.user.id);
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
 * @returns { id, name, description, pfpUrl, createdBy, createdAt }
 // filters: 
- isSaved (returns only the groups which are in Saved),
- isJoined (returns only the events which are in GroupMembers)
 **/
router.get("/", ensureLoggedIn, async function (req, res, next) {
  // filters for query
  const { isSaved, isJoined } = req.query;

  try {
    // fetching all the groups
    const groups = await Group.getAll(res.locals.user.id, isSaved, isJoined);

    return res.json({ data: groups });
  } catch (err) {
    return next(err);
  }
});

/**
 * PATCH /[id] { group } => { group }
 *
 * - Data can include:
 *   { name, description, pfpUrl }
 *
 * - Authorization required: logged in
 *
 * @returns { id, name, description, pfpUrl, createdBy, createdAt }
 *
 **/
router.patch("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const group = await Group.get(req.params.id, res.locals.user.id);

    if (!group) {
      throw new NotFoundError();
    }

    if (group.createdBy !== res.locals.user.id) {
      throw new UnauthorizedError();
    }

    const validator = jsonschema.validate(req.body, groupUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const updatedGroup = await Group.update(req.params.id, req.body);
    return res.json({ data: updatedGroup });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /[id] { group } => 204
 *
 * - Authorization required: logged in, created by
 *
 **/
router.delete("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const group = await Group.get(req.params.id, res.locals.user.id);

    if (group.createdBy?.toString() !== res.locals.user.id.toString()) {
      throw new UnauthorizedError();
    }

    await Group.delete(req.params.id);

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /[id]/membership  Join group with data
 *
 *  - Authorization required: logged in
 *
 *  * @returns { userId, eventId, createdAt }
 **/
router.post("/:id/membership", ensureLoggedIn, async function (req, res, next) {
  try {
    const group = await Group.get(req.params.id, res.locals.user.id);

    if (!group) {
      throw new NotFoundError();
    }

    const join = await GroupMember.add(res.locals.user.id, req.params.id);
    return res.json({ data: join });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /[id]/membership Leave group
 *
 * - Authorization required: logged in
 *
 *
 **/
router.delete(
  "/:id/membership",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const group = await Group.get(req.params.id, res.locals.user.id);

      if (!group) {
        throw new NotFoundError();
      }

      // group admin cannot leave the group
      if (group.createdBy === res.locals.user.id) {
        throw new ForbiddenError()
      }

      await GroupMember.remove(res.locals.user.id, req.params.id);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
);


/**
 * GET /[id]/members  Get members of a single group
 *
 *  - Authorization required: logged in
 *
 **/
router.get("/:id/members", ensureLoggedIn, async function (req, res, next) {
  try {
    const { id } = req.params;

    const group = await Group.get(id, res.locals.user.id);

    if (!group) {
      throw new NotFoundError();
    }
    const groupMembers = await GroupMember.get(id, res.locals.user.id);

    return res.json({ data: groupMembers });
  } catch (err) {
    return next(err);
  }
});


/**
 * GET /[id]/events  Get events of a single group
 *
 *  - Authorization required: logged in
 *
 **/
router.get("/:id/events", ensureLoggedIn, async function (req, res, next) {
  try {
    const { id } = req.params;

    const group = await Group.get(id, res.locals.user.id);

    if (!group) {
      throw new NotFoundError();
    }
    const groupEvents = await GroupEvent.get(id, res.locals.user.id);
    const linkedEventIds = groupEvents.map(({ eventId }) => eventId);
    const events = await Event.getByIds(linkedEventIds, res.locals.user.id);

    return res.json({ data: events });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /[id]/events/[id]/link    Link event to group
 *
 *  - Authorization required: logged in, createdBy
 *
 *  * @returns { eventId, groupId createdAt }
 **/
router.post(
  "/:groupId/events/:eventId/link",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const { groupId, eventId } = req.params;

      const event = await Event.get(eventId, res.locals.user.id);
      const group = await Group.get(groupId, res.locals.user.id);

      if (!event) {
        throw new NotFoundError();
      }
      if (!group) {
        throw new NotFoundError();
      }

      if (event.createdBy !== res.locals.user.id) {
        throw new UnauthorizedError();
      }
      if (group.createdBy !== res.locals.user.id) {
        throw new UnauthorizedError();
      }

      const groupEvent = await GroupEvent.add(event.id, group.id);
      return res.json({ data: groupEvent });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * DELETE /[id]/events/[id]/unlink  Remove event from group
 *
 * - Authorization required: logged in, createdBy
 *
 *
 **/
router.delete(
  "/:groupId/events/:eventId/unlink",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const { eventId, groupId } = req.params;

      const event = await Event.get(eventId, res.locals.user.id);
      const group = await Group.get(groupId, res.locals.user.id);

      if (!event) {
        throw new NotFoundError();
      }
      if (!group) {
        throw new NotFoundError();
      }

      // admin?
      if (event.createdBy !== res.locals.user.id) {
        throw new UnauthorizedError();
      }
      if (group.createdBy !== res.locals.user.id) {
        throw new UnauthorizedError();
      }

      await GroupEvent.remove(event.id, group.id);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * POST /[id]/posts  Make a post for a group
 *
 *  - Authorization required: logged in
 *
 *  * @returns { id, userId, groupId, text, createdAt, updatedAt }
 **/
router.post("/:id/posts", ensureLoggedIn, async function (req, res, next) {
  try {
    const group = await Group.get(req.params.id, res.locals.user.id);

    if (!group) {
      throw new NotFoundError();
    }

    const { text } = req.body;

    const post = await GroupPost.create(
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
 * @returns { id, userId, groupId, text, createdAt, updatedAt }
 **/
router.get("/:id/posts", ensureLoggedIn, async function (req, res, next) {
  try {
    const group = await Group.get(req.params.id, res.locals.user.id);

    if (!group) {
      throw new NotFoundError();
    }

    // fetching all the posts
    const posts = await GroupPost.getAll(req.params.id);

    return res.json({ data: posts });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /[id]/saved  Add group to Saved with data
 *
 *  - Authorization required: logged in
 *
 *  * @returns { userId, groupId, createdAt }
 **/
router.post("/:id/saved", ensureLoggedIn, async function (req, res, next) {
  try {
    const group = await Group.get(req.params.id, res.locals.user.id);

    if (!group) {
      throw new NotFoundError();
    }

    const save = await GroupSave.add(res.locals.user.id, req.params.id);
    return res.json({ data: save });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /[id]/saved  Remove group from Saved
 *
 * - Authorization required: logged in
 *
 **/
router.delete("/:id/saved", ensureLoggedIn, async function (req, res, next) {
  try {
    const group = await Group.get(req.params.id, res.locals.user.id);

    if (!group) {
      throw new NotFoundError();
    }

    await GroupSave.remove(res.locals.user.id, req.params.id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
