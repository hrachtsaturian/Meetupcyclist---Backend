"use strict";

/** Routes for event posts. */

const express = require("express");
const { UnauthorizedError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const EventPost = require("../models/eventPost");
const Event = require("../models/event");

const router = new express.Router();
/**
 * PATCH /[id] { post } => { post }
 *
 * - Data can include:
 *   { text }
 *
 * - Authorization required: logged in, createdBy
 *
 * @returns { id, userId, eventId, text, createdAt, updatedAt }
 *
 **/
router.patch("/:id", ensureLoggedIn, async function (req, res, next) {
    try {
        const post = await EventPost.getById(req.params.id);

        if (post.userId !== res.locals.user.id) {
            throw new UnauthorizedError();
        }

        const { text } = req.body;

        const updatedPost = await EventPost.update(req.params.id, text);

        return res.json({ data: updatedPost });
    } catch (err) {
        return next(err);
    }
});

/**
 * DELETE /[id] { post } => 204
 *
 * - Authorization required: logged in, createdBy or isAdmin or event creator
 *
 **/
router.delete("/:id", ensureLoggedIn, async function (req, res, next) {
    try {
        const post = await EventPost.getById(req.params.id);
        const event = await Event.get(post.eventId, res.locals.user.id);

        const isAdmin = res.locals.user.isAdmin;
        const isEventOwner =
            event.createdBy?.toString() === res.locals.user.id.toString();
        const isAuthor =
            post.userId?.toString() === res.locals.user.id.toString();

        if (!isAdmin && !isEventOwner && !isAuthor) {
            throw new UnauthorizedError();
        }

        await EventPost.delete(req.params.id);

        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
