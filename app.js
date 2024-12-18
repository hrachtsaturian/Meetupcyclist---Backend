"use strict";

/** Express app for meetupcyclist. */

const express = require("express");
const { NotFoundError } = require("./expressError");
const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const eventsRoutes = require("./routes/events");
const eventPostsRoutes = require("./routes/eventPosts");
const groupsRoutes = require("./routes/groups");
const groupPostsRoutes = require("./routes/groupPosts");
const locationsRoutes = require("./routes/locations");
const locationReviewsRoutes = require("./routes/locationReviews");
const uploadImage = require("./routes/uploadImage");

const app = express();

// policies
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://meetupcyclist.onrender.com");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.json());
app.use(authenticateJWT);

app.use("/", authRoutes);
app.use("/users", usersRoutes);
app.use("/events", eventsRoutes);
app.use("/eventPosts", eventPostsRoutes);
app.use("/groups", groupsRoutes);
app.use("/groupPosts", groupPostsRoutes);
app.use("/locations", locationsRoutes);
app.use("/locationReviews", locationReviewsRoutes);
app.use("/uploadImage", uploadImage);

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
