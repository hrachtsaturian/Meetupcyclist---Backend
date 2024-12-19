"use strict";

const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");

const saveProps = [
  `user_id AS "userId"`,
  `group_id AS "groupId"`,
  `created_at AS "createdAt"`,
];

const savePropsSqlQuery = saveProps.join(", ");

class GroupSave {
  /** Save with data.
   *
   * Returns { userId, groupId, createdAt }
   **/
  static async add(userId, groupId) {
    const query = `INSERT INTO group_saves 
                 (user_id,
                  group_id)
                 VALUES ($1, $2)
                 RETURNING ${savePropsSqlQuery}`;

    const values = [userId, groupId];

    const result = await db.query(query, values);
    const save = result.rows[0];

    return save;
  }

  /** Delete
   *
   *
   * Throws NotFoundError if not found.
   */
  static async remove(userId, groupId) {
    const querySql = `DELETE FROM group_saves WHERE user_id = $1 AND group_id = $2`;
    const values = [userId, groupId];

    const result = await db.query(querySql, values);

    if (result.rowCount === 0) {
      throw new NotFoundError(`No save found`);
    }
  }
}

module.exports = GroupSave;
