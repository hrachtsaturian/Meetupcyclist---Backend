"use strict";

const db = require("../db.js");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { NotFoundError } = require("../expressError.js");

const groupProps = [
  `id`,
  `name`,
  `description`,
  `created_by AS "createdBy"`,
  `created_at AS "createdAt"`,
];

const groupPropsGet = [
  `g.id`,
  `g.name`,
  `g.description`,
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
   * Returns { id, name, description, createdBy, createdAt }
   **/
  static async create({ name, description, createdBy }) {
    const result = await db.query(
      `INSERT INTO groups 
                 (name,
                  description, 
                  created_by)
                 VALUES ($1, $2, $3)
                 RETURNING ${groupPropsForUpdateSqlQuery}`,
      [name, description, createdBy]
    );

    const group = result.rows[0];

    return group;
  }

  /** Given an id, return a single group record.
   *
   * Returns { id, name, description, createdBy, createdAt }
   *
   * Throws NotFoundError if group not found.
   **/
  static async get(id, userId) {
    const groupRes = await db.query(`
      SELECT 
        ${groupPropsForReadSqlQuery},
        CASE WHEN gf.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isFavorite",
        CASE WHEN gm.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isJoined"
      FROM groups AS g
      JOIN users AS u 
        ON g.created_by = u.id
      LEFT JOIN group_favorites AS gf 
        ON g.id = gf.group_id AND gf.user_id = ${userId}
      LEFT JOIN group_members AS gm 
        ON g.id = gm.group_id AND gm.user_id = ${userId}
      WHERE g.id = ${id}`
    );

    const group = groupRes.rows[0];

    if (!group) throw new NotFoundError(`No group found`);
    return group;
  }

  /** Return array of groups.
   *
   * Returns data: [ {id, name, description, createdBy, createdAt}, ...]
   * 
   // filters: 
   - showFavorites (returns only the groups which are in Favorites),
   - showJoinedGroups (returns only the groups which are in GroupMembers)
   **/
  static async getAll(userId, showFavorites, showJoinedGroups) {
    let query = `
      SELECT 
        ${groupPropsForReadSqlQuery},
        CASE WHEN gf.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isFavorite",
        CASE WHEN gm.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isJoined"
      FROM groups AS g
      JOIN users AS u 
        ON g.created_by = u.id
      LEFT JOIN group_favorites AS gf 
        ON g.id = gf.group_id AND gf.user_id = ${userId}
      LEFT JOIN group_members AS gm 
        ON g.id = gm.group_id AND gm.user_id = ${userId}
    `;

    // Add condition for filtering 
    if (showFavorites === "true") {
      query += ' WHERE gf.user_id IS NOT NULL';
    }

    if (showJoinedGroups === "true") {
      query += ' WHERE gm.user_id IS NOT NULL';
    }

    query = query + ' ORDER by g.created_at DESC';

    const groupRes = await db.query(query);

    const groups = groupRes.rows;

    return groups || [];
  }

  /** Update group data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { name, description }
   *
   * Returns { id, name, description, createdBy, createdAt }
   *
   * Throws NotFoundError if not found.
   */
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data);

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
