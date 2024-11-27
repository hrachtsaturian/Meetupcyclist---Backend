"use strict";

/** Express app for meetupcyclist. */

const express = require("express");
const { NotFoundError } = require("./expressError");
const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const eventsRoutes = require("./routes/events")
const groupsRoutes = require("./routes/groups")
const locationsRoutes = require("./routes/locations")

const app = express();

app.use(express.json());
app.use(authenticateJWT);

// policies
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use("/", authRoutes);
app.use("/users", usersRoutes);
app.use("/events", eventsRoutes);
app.use("/groups", groupsRoutes);
app.use("/locations", locationsRoutes);

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
