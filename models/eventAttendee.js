"use strict";

const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");

const attendanceProps = [
  `user_id AS "userId"`,
  `event_id AS "eventId"`,
  `created_at AS "createdAt"`
];

const attendancePropsGet = [
  `ea.user_id AS "userId"`,
  `ea.event_id AS "eventId"`,
  `ea.created_at AS "createdAt"`,
  `u.first_name AS "firstName"`,
  `u.last_name AS "lastName"`,
  `u.email`,
  `u.bio`,
  `u.pfp_url AS "pfpUrl"`,
  `u.is_admin AS "isAdmin"`,
];

const attendancePropsForUpdateSqlQuery = attendanceProps.join(", ");
const attendancePropsForReadSqlQuery = attendancePropsGet.join(", ");

class EventAttendee {
  /** Get array of attendees of a single event.
   *
   * Returns [{ user_id, eventId, createdAt }, ...]
   **/
    static async get(eventId) {
      const result = await db.query(
        `SELECT ${attendancePropsForReadSqlQuery}
          FROM event_attendees AS ea
          JOIN users AS u 
          ON ea.user_id = u.id
          WHERE ea.event_id = $1`,
        [eventId]
      );
      const eventAttendees = result.rows;
  
      return eventAttendees;
    }
    
  /** Sign up for event with data.
   *
   * Returns { userId, eventId, createdAt }
   **/
  static async add(userId, eventId) {
    const query = `INSERT INTO event_attendees 
                 (user_id,
                  event_id)
                 VALUES ($1, $2)
                 RETURNING ${attendancePropsForUpdateSqlQuery}`;

    const values = [userId, eventId];

    const result = await db.query(query, values);
    const attendance = result.rows[0];

    return attendance;
  }

  /** Delete
   *
   *
   * Throws NotFoundError if not found.
   */
  static async remove(userId, eventId) {
    const querySql = `DELETE FROM event_attendees WHERE user_id = ${userId} AND event_id = ${eventId}`;

    const result = await db.query(querySql);

    if (result.rowCount === 0) {
      throw new NotFoundError(`No attendance found`);
    }
  }
}

module.exports = EventAttendee;
