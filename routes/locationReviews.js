"use strict";

/** Routes for location reviews. */

const express = require("express");
const { UnauthorizedError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const LocationReview = require("../models/locationReview");

const router = new express.Router();
/**
 * PATCH /[id] { review } => { review }
 *
 * - Data can include:
 *   { text, rate }
 *
 * - Authorization required: logged in, createdBy
 *
 * @returns { id, userId, locationId, text, rate, createdAt, updatedAt }
 *
 **/
router.patch("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const review = await LocationReview.getById(req.params.id);

    if (review.userId !== res.locals.user.id) {
      throw new UnauthorizedError();
    }

    const { text, rate } = req.body;

    const updatedReview = await LocationReview.update(
      req.params.id,
      text,
      rate
    );

    return res.json({ data: updatedReview });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /[id] { review } => 204
 *
 * - Authorization required: logged in, createdBy or isAdmin
 *
 **/
router.delete("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const review = await LocationReview.getById(req.params.id);

    const isAdmin = res.locals.user.isAdmin;
    const isAuthor =
      review.userId?.toString() === res.locals.user.id.toString();

    if (!isAdmin && !isAuthor) {
      throw new UnauthorizedError();
    }

    await LocationReview.delete(req.params.id);

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
