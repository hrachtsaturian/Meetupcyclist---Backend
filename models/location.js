"use strict";

const db = require("../db.js");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { NotFoundError } = require("../expressError.js");

const locationProps = [
  `id`,
  `name`,
  `description`,
  `address`,
  `created_by AS "createdBy"`,
  `created_at AS "createdAt"`,
];

const locationPropsSqlQuery = locationProps.join(", ");

class Location {
  /** Create location with data.
   *
   * Returns { id, name, description, address, createdAt }
   **/
  static async create({ name, description, address, createdBy }) {
    const result = await db.query(
      `INSERT INTO locations 
                 (name,
                  description, 
                  address,
                  created_by)
                 VALUES ($1, $2, $3, $4)
                 RETURNING ${locationPropsSqlQuery}`,
      [name, description, address, createdBy]
    );

    const location = result.rows[0];

    return location;
  }

  /** Given an id, return a single location record.
   *
   * Returns { id, name, description, address, createdAt }
   *
   * Throws NotFoundError if location not found.
   **/
  static async get(id) {
    const locationRes = await db.query(
      `SELECT ${locationPropsSqlQuery} FROM locations WHERE id = ${id}`
    );

    const location = locationRes.rows[0];

    if (!location) throw new NotFoundError(`No location found`);

    return location;
  }

  /**
   *
   * Returns { id, name, description, address, createdAt }
   *
   * Throws NotFoundError if group not found.
   **/
  static async getAll() {
    const locationRes = await db.query(
      `SELECT ${locationPropsSqlQuery} FROM locations`
    );

    const locations = locationRes.rows;

    return locations || [];
  }

  /** Update location data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { name, description, address }
   *
   * Returns { id, name, description, address, createdAt }
   *
   * Throws NotFoundError if not found.
   */
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data);

    const querySql = `UPDATE locations
                      SET ${setCols}
                      WHERE id = ${id}
                      RETURNING ${locationPropsSqlQuery}`;

    const result = await db.query(querySql, values);
    const location = result.rows[0];

    if (!location) throw new NotFoundError(`No location found`);

    return location;
  }

  /** Delete
   *
   *
   * Throws NotFoundError if not found.
   */
  static async delete(id) {
    const querySql = `DELETE FROM locations WHERE id = ${id}`;

    const result = await db.query(querySql);

    if (result.rowCount === 0) {
      throw new NotFoundError(`No location found`);
    }
  }
}

module.exports = Location;
