"use strict";

const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");

const favProps = [
  `user_id AS "userId"`,
  `event_id AS "eventId"`,
  `created_at AS "createdAt"`,
];

const favPropsSqlQuery = favProps.join(", ");

class EventFavorite {
  /** Add favorite with data.
   *
   * Returns { userId, eventId, createdAt }
   **/
  static async add(userId, eventId) {
    const query = `INSERT INTO event_favorites 
                 (user_id,
                  event_id)
                 VALUES ($1, $2)
                 RETURNING ${favPropsSqlQuery}`;

    const values = [userId, eventId];

    const result = await db.query(query, values);
    const fav = result.rows[0];

    return fav;
  }

  /** Delete
   *
   *
   * Throws NotFoundError if not found.
   */
  static async remove(userId, eventId) {
    const querySql = `DELETE FROM event_favorites WHERE user_id = ${userId} AND event_id = ${eventId}`;

    const result = await db.query(querySql);

    if (result.rowCount === 0) {
      throw new NotFoundError(`No favorite found`);
    }
  }
}

module.exports = EventFavorite;
