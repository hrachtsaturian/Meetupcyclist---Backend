"use strict";

const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");

const membershipProps = [
  `user_id AS "userId"`,
  `group_id AS "groupId"`,
  `created_at AS "createdAt"`,
];

const membershipPropsGet = [
  `gm.user_id AS "userId"`,
  `gm.group_id AS "groupId"`,
  `gm.created_at AS "createdAt"`,
  `u.first_name AS "firstName"`,
  `u.last_name AS "lastName"`,
  `u.email`,
  `u.bio`,
  `u.pfp_url AS "pfpUrl"`,
  `u.is_admin AS "isAdmin"`,
];

const membershipPropsForUpdateSqlQuery = membershipProps.join(", ");
const membershipPropsForReadSqlQuery = membershipPropsGet.join(", ");

class GroupMember {
  /** Get array of members of a single group.
   *
   * Returns [{ user_id, groupId, createdAt }, ...]
   **/
  static async get(groupId) {
    const result = await db.query(
      `SELECT ${membershipPropsForReadSqlQuery}
        FROM group_members AS gm
        JOIN users AS u 
        ON gm.user_id = u.id
        WHERE gm.group_id = $1`,
      [groupId]
    );
    const groupMembers = result.rows;

    return groupMembers;
  }

  /** Join group with data.
   *
   * Returns { userId, groupId, createdAt }
   **/
  static async add(userId, groupId) {
    const query = `INSERT INTO group_members
                 (user_id,
                  group_id)
                 VALUES ($1, $2)
                 RETURNING ${membershipPropsForUpdateSqlQuery}`;

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
