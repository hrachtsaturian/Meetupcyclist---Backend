"use strict";

const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");

const saveProps = [
  `user_id AS "userId"`,
  `event_id AS "eventId"`,
  `created_at AS "createdAt"`,
];

const savePropsSqlQuery = saveProps.join(", ");

class EventSave {
  /** Save with data.
   *
   * Returns { userId, eventId, createdAt }
   **/
  static async add(userId, eventId) {
    const query = `INSERT INTO event_saves 
                 (user_id,
                  event_id)
                 VALUES ($1, $2)
                 RETURNING ${savePropsSqlQuery}`;

    const values = [userId, eventId];

    const result = await db.query(query, values);
    const save = result.rows[0];

    return save;
  }

  /** Delete
   *
   *
   * Throws NotFoundError if not found.
   */
  static async remove(userId, eventId) {
    const querySql = `DELETE FROM event_saves WHERE user_id = ${userId} AND event_id = ${eventId}`;

    const result = await db.query(querySql);

    if (result.rowCount === 0) {
      throw new NotFoundError(`No save found`);
    }
  }
}

module.exports = EventSave;
