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

const groupPropsSqlQuery = groupProps.join(", ");

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
                 RETURNING ${groupPropsSqlQuery}`,
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
  static async get(id) {
    const groupRes = await db.query(
      `SELECT ${groupPropsSqlQuery} FROM groups WHERE id = ${id}`
    );

    const group = groupRes.rows[0];

    if (!group) throw new NotFoundError(`No group found`);

    return group;
  }

  /** Return array of groups.
   *
   * Returns data: [ {id, name, description, createdBy, createdAt}, ...]
   **/
  static async getAll() {
    const groupRes = await db.query(`SELECT ${groupPropsSqlQuery} FROM groups`);

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
                      RETURNING ${groupPropsSqlQuery}`;

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
