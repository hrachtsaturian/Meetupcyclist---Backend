"use strict";

/** Routes for groups. */

const express = require("express");
const router = new express.Router();
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} = require("../expressError");
const jsonschema = require("jsonschema");

const Group = require("../models/group");
const GroupMember = require("../models/groupMember");
const GroupFavorite = require("../models/groupFavorite");
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
    const group = await Group.create({
      name,
      description,
      createdBy: res.locals.user.id,
    });
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
 * @returns { id, name, description, createdBy, createdAt }
 // filters: 
- showFavorites (returns only the groups which are in Favorites),
- showJoinedGroups (returns only the events which are in GroupMembers)
 **/
router.get("/", ensureLoggedIn, async function (req, res, next) {
  // filters for query
  const { showFavorites, showJoinedGroups } = req.query;

  try {
    // fetching all the groups
    const groups = await Group.getAll(res.locals.user.id, showFavorites, showJoinedGroups);

    return res.json({ data: groups });
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

    const join = await GroupMember.add(
      res.locals.user.id,
      req.params.id
    );
    return res.json({ data: join });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /[id]/membership Withdraw from group
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

      await GroupMember.remove(res.locals.user.id, req.params.id);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * POST /[id]/favorite  Add group to favorites with data
 *
 *  - Authorization required: logged in
 *
 *  * @returns { userId, groupId, createdAt }
 **/
router.post("/:id/favorite", ensureLoggedIn, async function (req, res, next) {
  try {
    const group = await Group.get(req.params.id, res.locals.user.id);

    if (!group) {
      throw new NotFoundError();
    }

    const favorite = await GroupFavorite.add(res.locals.user.id, req.params.id);
    return res.json({ data: favorite });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /[id]/favorite  Remove group from favorites
 *
 * - Authorization required: logged in
 *
 **/
router.delete("/:id/favorite", ensureLoggedIn, async function (req, res, next) {
  try {
    const group = await Group.get(req.params.id, res.locals.user.id);

    if (!group) {
      throw new NotFoundError();
    }

    await GroupFavorite.remove(res.locals.user.id, req.params.id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;