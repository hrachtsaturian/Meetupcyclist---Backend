"use strict";

const db = require("../db.js");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { NotFoundError } = require("../expressError.js");

const groupProps = [
  `id`,
  `name`,
  `description`,
  `pfp_url AS "pfpUrl"`,
  `created_by AS "createdBy"`,
  `created_at AS "createdAt"`,
];

const groupPropsGet = [
  `g.id`,
  `g.name`,
  `g.description`,
  `g.pfp_url AS "pfpUrl"`,
  `g.created_by AS "createdBy"`,
  `g.created_at AS "createdAt"`,
  `u.first_name AS "firstName"`,
  `u.last_name AS "lastName"`,
  `u.id AS "userId"`,
];

const groupPropsForUpdateSqlQuery = groupProps.join(", ");
const groupPropsForReadSqlQuery = groupPropsGet.join(", ");

class Group {
  /** Create group with data.
   *
   * Returns { id, name, description, pfpUrl, createdBy, createdAt }
   **/
  static async create({ name, description, pfpUrl, createdBy }) {
    const result = await db.query(
      `INSERT INTO groups 
                 (name,
                  description,
                  pfp_url, 
                  created_by)
                 VALUES ($1, $2, $3, $4)
                 RETURNING ${groupPropsForUpdateSqlQuery}`,
      [name, description, pfpUrl, createdBy]
    );

    const group = result.rows[0];

    return group;
  }

  /** Given an id, return a single group record.
   *
   * Returns { id, name, description, pfpUrl, createdBy, createdAt }
   *
   * Throws NotFoundError if group not found.
   **/
  static async get(id, userId) {
    const groupRes = await db.query(`
      SELECT 
        ${groupPropsForReadSqlQuery},
        CASE WHEN gs.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isSaved",
        CASE WHEN gm.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isJoined",
        COALESCE((SELECT COUNT(*) FROM group_members AS gm WHERE gm.group_id = g.id), 0) ::integer AS "membersCount"
      FROM groups AS g
      JOIN users AS u
        ON g.created_by = u.id
      LEFT JOIN group_saves AS gs
        ON g.id = gs.group_id AND gs.user_id = ${userId}
      LEFT JOIN group_members AS gm
        ON g.id = gm.group_id AND gm.user_id = ${userId}
      WHERE g.id = ${id}`);

    const group = groupRes.rows[0];

    if (!group) throw new NotFoundError(`No group found`);
    return group;
  }

  /** Return array of groups.
   *
   * Returns data: [ {id, name, description, pfpUrl, createdBy, createdAt}, ...]
   * 
   // filters: 
   - isSaved (returns only the groups which are in Saved),
   - isJoined (returns only the groups which are in GroupMembers)
   - createdBy (returns only the groups which were created by specific user)
   **/
  static async getAll({
    userId,
    filter: { isSaved = null, isJoined = null, createdBy = null } = {},
  }) {
    let query = `
      SELECT 
        ${groupPropsForReadSqlQuery},
        CASE WHEN gs.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isSaved",
        CASE WHEN gm.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isJoined",
        COALESCE((SELECT COUNT(*) FROM group_members AS gm WHERE gm.group_id = g.id), 0) ::integer AS "membersCount"
      FROM groups AS g
      JOIN users AS u 
        ON g.created_by = u.id
      LEFT JOIN group_saves AS gs 
        ON g.id = gs.group_id AND gs.user_id = ${userId}
      LEFT JOIN group_members AS gm 
        ON g.id = gm.group_id AND gm.user_id = ${userId}
    `;

    let conditions = [];
    let params = [];

    if (isSaved) {
      conditions.push("gs.user_id IS NOT NULL");
    }

    if (isJoined) {
      conditions.push("gm.user_id IS NOT NULL");
    }

    if (createdBy) {
      params.push(createdBy);
      conditions.push(`g.created_by = $${params.length}`);
    }

    // Combine all conditions into a WHERE clause if any exist
    const whereClause =
      conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";

    const sortClause = ` ORDER BY "membersCount" DESC, g.created_at DESC`;

    query = query + whereClause + sortClause;

    const groupRes = await db.query(query, params);

    const groups = groupRes.rows;

    return groups || [];
  }

  /** Update group data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { name, description, pfpUrl }
   *
   * Returns { id, name, description, pfpUrl, createdBy, createdAt }
   *
   * Throws NotFoundError if not found.
   */
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      pfpUrl: "pfp_url",
    });

    const querySql = `UPDATE groups
                      SET ${setCols}
                      WHERE id = ${id}
                      RETURNING ${groupPropsForUpdateSqlQuery}`;

    const result = await db.query(querySql, values);
    const group = result.rows[0];

    if (!group) throw new NotFoundError(`No group found`);

    return group;
  }

  /** Delete
   *
   *
   * Throws NotFoundError if not found.
   */
  static async delete(id) {
    const querySql = `DELETE FROM groups WHERE id = ${id}`;

    const result = await db.query(querySql);

    if (result.rowCount === 0) {
      throw new NotFoundError(`No group found`);
    }
  }
}

module.exports = Group;
