"use strict";

const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");

const favProps = [
  `user_id AS "userId"`,
  `group_id AS "groupId"`,
  `created_at AS "createdAt"`,
];

const favPropsSqlQuery = favProps.join(", ");

class GroupFavorite {
  /** Add favorite with data.
   *
   * Returns { userId, groupId, createdAt }
   **/
  static async add(userId, groupId) {
    const query = `INSERT INTO group_favorites 
                 (user_id,
                  group_id)
                 VALUES ($1, $2)
                 RETURNING ${favPropsSqlQuery}`;

    const values = [userId, groupId];

    const result = await db.query(query, values);
    const fav = result.rows[0];

    return fav;
  }

  /** Delete
   *
   *
   * Throws NotFoundError if not found.
   */
  static async remove(userId, groupId) {
    const querySql = `DELETE FROM group_favorites WHERE user_id = ${userId} AND group_id = ${groupId}`;

    const result = await db.query(querySql);

    if (result.rowCount === 0) {
      throw new NotFoundError(`No favorite found`);
    }
  }
}

module.exports = GroupFavorite;
