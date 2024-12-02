"use strict";

const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");

const favProps = [
  `user_id AS "userId"`,
  `location_id AS "locationId"`,
  `created_at AS "createdAt"`,
];

const favPropsSqlQuery = favProps.join(", ");

class LocationFavorite {
  /** Add favorite with data.
   *
   * Returns { userId, locationId, createdAt }
   **/
  static async add(userId, locationId) {
    const query = `INSERT INTO location_favorites 
                 (user_id,
                  location_id)
                 VALUES ($1, $2)
                 RETURNING ${favPropsSqlQuery}`;

    const values = [userId, locationId];

    const result = await db.query(query, values);
    const fav = result.rows[0];

    return fav;
  }

  /** Delete
   *
   *
   * Throws NotFoundError if not found.
   */
  static async remove(userId, locationId) {
    const querySql = `DELETE FROM location_favorites WHERE user_id = ${userId} AND location_id = ${locationId}`;

    const result = await db.query(querySql);

    if (result.rowCount === 0) {
      throw new NotFoundError(`No favorite found`);
    }
  }
}

module.exports = LocationFavorite;
