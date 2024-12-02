"use strict";

const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");

const membershipProps = [
  `user_id AS "userId"`,
  `group_id AS "groupId"`,
  `created_at AS "createdAt"`,
];

const membershipPropsSqlQuery = membershipProps.join(", ");

class GroupMember {
  /** Join group with data.
   *
   * Returns { userId, groupId, createdAt }
   **/
  static async add(userId, groupId) {
    const query = `INSERT INTO group_members
                 (user_id,
                  group_id)
                 VALUES ($1, $2)
                 RETURNING ${membershipPropsSqlQuery}`;

    const values = [userId, groupId];

    const result = await db.query(query, values);
    const membership = result.rows[0];

    return membership;
  }

  /** Delete
   *
   *
   * Throws NotFoundError if not found.
   */
  static async remove(userId, groupId) {
    const querySql = `DELETE FROM group_members WHERE user_id = ${userId} AND group_id = ${groupId}`;

    const result = await db.query(querySql);

    if (result.rowCount === 0) {
      throw new NotFoundError(`No membership found`);
    }
  }
}

module.exports = GroupMember;
