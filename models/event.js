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
  `pfp_url AS "pfpUrl"`,
  `created_by AS "createdBy"`,
  `created_at AS "createdAt"`,
];

const eventPropsGet = [
  `e.id`,
  `e.title`,
  `e.description`,
  `e.date`,
  `e.location`,
  `e.pfp_url AS "pfpUrl"`,
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
   * Returns { id, title, description, date, location, pfpUrl, createdBy, createdAt }
   **/
  static async create({
    title,
    description,
    date,
    location,
    pfpUrl,
    createdBy,
  }) {
    const result = await db.query(
      `INSERT INTO events 
                 (title,
                  description, 
                  date,
                  location,
                  pfp_url,
                  created_by)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING ${eventPropsForUpdateSqlQuery}`,
      [title, description, date, location, pfpUrl, createdBy]
    );

    const event = result.rows[0];

    return event;
  }

  /** Given an id, return single event record.
   *
   * Returns { id, title, description, date, location, pfpUrl, createdBy, createdAt }
   *
   * Throws NotFoundError if event not found.
   **/
  static async get(id, userId) {
    const eventRes = await db.query(`
      SELECT 
        ${eventPropsForReadSqlQuery},
        CASE WHEN es.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isSaved",
        CASE WHEN ea.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isAttending",
        COALESCE((SELECT COUNT(*) FROM event_attendees AS es WHERE es.event_id = e.id), 0) ::integer AS "attendeesCount"
      FROM events AS e
      JOIN users AS u 
        ON e.created_by = u.id
      LEFT JOIN event_saves AS es
        ON e.id = es.event_id AND es.user_id = ${userId}
      LEFT JOIN event_attendees AS ea 
        ON e.id = ea.event_id AND ea.user_id = ${userId}
        WHERE e.id = ${id}`);

    const event = eventRes.rows[0];

    if (!event) throw new NotFoundError(`No event found`);
    return event;
  }

  
  /** Given an user id, return array of events.
   *
   * Returns [{ id, title, description, date, location, pfpUrl, createdBy, createdAt }, ...]
   *
   **/
  static async getByIds(ids = [], userId) {
    const eventRes = await db.query(
      `
      SELECT 
        ${eventPropsForReadSqlQuery},
        CASE WHEN es.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isSaved",
        CASE WHEN ea.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isAttending",
        COALESCE((SELECT COUNT(*) FROM event_attendees AS es WHERE es.event_id = e.id), 0) ::integer AS "attendeesCount"
      FROM events AS e
      JOIN users AS u 
        ON e.created_by = u.id
      LEFT JOIN event_saves AS es
        ON e.id = es.event_id AND es.user_id = ${userId}
      LEFT JOIN event_attendees AS ea 
        ON e.id = ea.event_id AND ea.user_id = ${userId}
        WHERE e.id = ANY($1) AND e.date > NOW()
        ORDER BY e.date`,
      [ids]
    );

    const events = eventRes.rows;

    return events || [];
  }


  /** Return array of events.
   *
   * Returns data: [ {id, title, description, date, location, pfpUrl, createdBy, createdAt}, ...]
   *
   // filters: 
   - isSaved (returns only the events which are in Saved),
   - isAttending (returns only the events which were in EventAttendees and upcoming)
   - minDate (additional query to show upcoming events only)
   - maxDate (additional query to show events which already passed)
   - createdBy (returns only the events which were created by specific user)
  
   - sort query to sort events 
   **/
  static async getAll({
    userId,
    filter: {
      isSaved = false,
      isAttending = false,
      minDate = null,
      maxDate = null,
      createdBy = null,
    },
    sort,
  }) {
    let query = `
      SELECT 
        ${eventPropsForReadSqlQuery},
        CASE WHEN es.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isSaved",
        CASE WHEN ea.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isAttending",
        COALESCE((SELECT COUNT(*) FROM event_attendees AS es WHERE es.event_id = e.id), 0) ::integer AS "attendeesCount"
      FROM events AS e
      JOIN users AS u 
        ON e.created_by = u.id
      LEFT JOIN event_saves AS es
        ON e.id = es.event_id AND es.user_id = ${userId}
      LEFT JOIN event_attendees AS ea 
        ON e.id = ea.event_id AND ea.user_id = ${userId}`;

    let conditions = [];
    let params = [];

    if (isSaved) {
      conditions.push("es.user_id IS NOT NULL");
    }

    if (isAttending) {
      conditions.push("ea.user_id IS NOT NULL");
    }

    if (minDate) {
      params.push(minDate);
      conditions.push(`e.date >= $${params.length}`);
    }

    if (maxDate) {
      params.push(maxDate);
      conditions.push(`e.date <= $${params.length}`);
    }

    if (createdBy) {
      params.push(createdBy);
      conditions.push(`e.created_by = $${params.length}`);
    }

    // Combine all conditions into a WHERE clause if any exist
    const whereClause =
      conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";

    const sortClause = ` ORDER BY e.date ${sort.date}`;

    query = query + whereClause + sortClause;

    const eventRes = await db.query(query, params);

    const events = eventRes.rows;

    return events || [];
  }


  /** Update event data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { title, description, date, location, pfpUrl }
   *
   * Returns { id, title, description, date, location, pfpUrl, createdBy, createdAt }
   *
   * Throws NotFoundError if not found.
   */
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      pfpUrl: "pfp_url",
    });

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
