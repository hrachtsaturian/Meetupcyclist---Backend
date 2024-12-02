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

const eventPropsGet = [
  `e.id`,
  `e.title`,
  `e.description`,
  `e.date`,
  `e.location`,
  `e.created_by AS "createdBy"`,
  `e.created_at AS "createdAt"`,
  `u.first_name AS "firstName"`,
  `u.last_name AS "lastName"`,
  `u.id AS "userId"`,
];

const eventPropsForUpdateSqlQuery = eventProps.join(", ");
const eventPropsForReadSqlQuery = eventPropsGet.join(", ");

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
                 RETURNING ${eventPropsForUpdateSqlQuery}`,
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
  static async get(id, userId) {
    const eventRes = await db.query(`
      SELECT 
        ${eventPropsForReadSqlQuery},
        CASE WHEN ef.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isFavorite",
        CASE WHEN ea.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isAttending"
      FROM events AS e
      JOIN users AS u 
        ON e.created_by = u.id
      LEFT JOIN event_favorites AS ef 
        ON e.id = ef.event_id AND ef.user_id = ${userId}
      LEFT JOIN event_attendees AS ea 
        ON e.id = ea.event_id AND ea.user_id = ${userId}
        WHERE e.id = ${id}`
    );

    const event = eventRes.rows[0];

    if (!event) throw new NotFoundError(`No event found`);
    return event;
  }

  /** Return array of events.
   *
   * Returns data: [ {id, title, description, date, location, createdBy, createdAt}, ...]
   *
   // filters: 
   - showFavorites (returns only the events which are in Favorites),
   - showAttendingEvents (returns only the events which are in EventAttendees)
   **/
  static async getAll(userId, showFavorites, showAttendingEvents) {
    let query = `
      SELECT 
        ${eventPropsForReadSqlQuery},
        CASE WHEN ef.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isFavorite",
        CASE WHEN ea.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isAttending"
      FROM events AS e
      JOIN users AS u 
        ON e.created_by = u.id
      LEFT JOIN event_favorites AS ef 
        ON e.id = ef.event_id AND ef.user_id = ${userId}
      LEFT JOIN event_attendees AS ea 
        ON e.id = ea.event_id AND ea.user_id = ${userId}`;

    // Add condition for filtering
    if (showFavorites === "true") {
      query += ' WHERE ef.user_id IS NOT NULL';
    }

    if (showAttendingEvents === "true") {
      query += ' WHERE ea.user_id IS NOT NULL';
    }

    query = query + ' ORDER by e.created_at DESC'

    const eventRes = await db.query(query);

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
   * Returns { id, title, description, date, location, createdBy, createdAt }
   *
   * Throws NotFoundError if not found.
   */
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data);

    const querySql = `UPDATE events
                        SET ${setCols}
                        WHERE id = ${id}
                        RETURNING ${eventPropsForUpdateSqlQuery}`;

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
