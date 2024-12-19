"use strict";

const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");

const saveProps = [
  `user_id AS "userId"`,
  `location_id AS "locationId"`,
  `created_at AS "createdAt"`,
];

const savePropsSqlQuery = saveProps.join(", ");

class LocationSave {
  /** Save with data.
   *
   * Returns { userId, locationId, createdAt }
   **/
  static async add(userId, locationId) {
    const query = `INSERT INTO location_saves
                 (user_id,
                  location_id)
                 VALUES ($1, $2)
                 RETURNING ${savePropsSqlQuery}`;

    const values = [userId, locationId];

    const result = await db.query(query, values);
    const save = result.rows[0];

    return save;
  }

  /** Delete
   *
   *
   * Throws NotFoundError if not found.
   */
  static async remove(userId, locationId) {
    const querySql = `DELETE FROM location_saves WHERE user_id = $1 AND location_id = $2`;
    const values = [userId, locationId];

    const result = await db.query(querySql, values);

    if (result.rowCount === 0) {
      throw new NotFoundError(`No save found`);
    }
  }
}

module.exports = LocationSave;
