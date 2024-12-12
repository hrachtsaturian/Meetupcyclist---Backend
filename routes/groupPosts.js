"use strict";

/** Routes for group posts. */

const express = require("express");
const { UnauthorizedError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const GroupPost = require("../models/groupPost");
const Group = require("../models/group");

const router = new express.Router();
/**
 * PATCH /[id] { post } => { post }
 *
 * - Data can include:
 *   { text }
 *
 * - Authorization required: logged in, createdBy
 *
 * @returns { id, userId, groupId, text, createdAt, updatedAt }
 *
 **/
router.patch("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const post = await GroupPost.getById(req.params.id);

    if (post.userId !== res.locals.user.id) {
      throw new UnauthorizedError();
    }

    const { text } = req.body;

    const updatedPost = await GroupPost.update(req.params.id, text);

    return res.json({ data: updatedPost });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /[id] { post } => 204
 *
 * - Authorization required: logged in, createdBy or isAdmin or group creator
 *
 **/
router.delete("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const post = await GroupPost.getById(req.params.id);
    const group = await Group.get(post.groupId, res.locals.user.id);

    const isAdmin = res.locals.user.isAdmin;
    const isGroupOwner =
      group.createdBy?.toString() === res.locals.user.id.toString();
    const isAuthor =
      post.userId?.toString() === res.locals.user.id.toString();

    if (!isAdmin && !isGroupOwner && !isAuthor) {
      throw new UnauthorizedError();
    }

    await GroupPost.delete(req.params.id);

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
