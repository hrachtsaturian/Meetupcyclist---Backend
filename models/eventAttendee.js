"use strict";

const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");

const attendanceProps = [
  `user_id AS "userId"`,
  `event_id AS "eventId"`,
  `created_at AS "createdAt"`,
];

const attendancePropsSqlQuery = attendanceProps.join(", ");

class EventAttendee {
  /** Sign up for event with data.
   *
   * Returns { userId, eventId, createdAt }
   **/
  static async add(userId, eventId) {
    const query = `INSERT INTO event_attendees 
                 (user_id,
                  event_id)
                 VALUES ($1, $2)
                 RETURNING ${attendancePropsSqlQuery}`;

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
