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
    const eventRes = await db.query(
      `SELECT ${eventPropsForReadSqlQuery}, EXISTS (
            SELECT 1 
            FROM event_favorites AS ef 
            WHERE ef.event_id = e.id AND ef.user_id = ${userId}
          ) AS "isFavorite"
        FROM events AS e 
        JOIN users AS u 
        ON e.created_by = u.id 
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
   * filter -  showFavorites - additional query for filtering only the favorite events
   **/
  static async getAll(userId, showFavorites) {
    let query = `SELECT ${eventPropsForReadSqlQuery}, EXISTS (
          SELECT 1 
          FROM event_favorites AS ef 
          WHERE ef.event_id = e.id AND ef.user_id = ${userId}
        ) AS "isFavorite"
        FROM events AS e 
        JOIN users AS u 
        ON e.created_by = u.id`;

    if (showFavorites) {
      query =
        query +
        ` WHERE EXISTS (
        SELECT 1 
        FROM event_favorites AS ef 
        WHERE ef.event_id = e.id AND ef.user_id = ${userId}
      );`;
    }

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
   * Returns { id, title, description, date, location, createdBy }
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
