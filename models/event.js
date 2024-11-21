"use strict";

const db = require("../db.js");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { NotFoundError } = require("../expressError.js");

const eventProps = [
  `id`,
  `title`,
  `description`,
  `date`,
  `location`,
  `created_by AS "createdBy"`,
  `created_at AS "createdAt"`,
];

const eventPropsSqlQuery = eventProps.join(", ");

class Event {
  /** Create event with data.
   *
   * Returns { id, title, description, date, location, createdBy, createdAt }
   **/
  static async create({ title, description, date, location, createdBy }) {
    const result = await db.query(
      `INSERT INTO events 
                 (title,
                  description, 
                  date,
                  location,
                  created_by)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING ${eventPropsSqlQuery}`,
      [title, description, date, location, createdBy]
    );

    const event = result.rows[0];

    return event;
  }

  /** Given an id, return single event record.
   *
   * Returns { id, title, description, date, location, createdBy, createdAt }
   *
   * Throws NotFoundError if event not found.
   **/
  static async get(id) {
    const eventRes = await db.query(
      `SELECT ${eventPropsSqlQuery} FROM events WHERE id = ${id}`
    );

    const event = eventRes.rows[0];

    if (!event) throw new NotFoundError(`No event found`);

    return event;
  }

  // todo: filter by group, user, etc
  static async getAll() {
    const eventRes = await db.query(`SELECT ${eventPropsSqlQuery} FROM events`);

    const events = eventRes.rows;

    return events || [];
  }

  /** Update event data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { title, description, date, location }
   *
   * Returns { id, title, description, date, location, createdBy }
   *
   * Throws NotFoundError if not found.
   */
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data);

    const querySql = `UPDATE events
                      SET ${setCols}
                      WHERE id = ${id}
                      RETURNING ${eventPropsSqlQuery}`;

    const result = await db.query(querySql, values);
    const event = result.rows[0];

    if (!event) throw new NotFoundError(`No event found`);

    return event;
  }

  /** Delete
   *
   *
   * Throws NotFoundError if not found.
   */
  static async delete(id) {
    const querySql = `DELETE FROM events WHERE id = ${id}`;

    const result = await db.query(querySql);

    if (result.rowCount === 0) {
      throw new NotFoundError(`No event found`);
    }
  }
}

module.exports = Event;
