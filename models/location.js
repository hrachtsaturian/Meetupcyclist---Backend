"use strict";

const db = require("../db.js");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { NotFoundError } = require("../expressError.js");

const locationProps = [
  `id`,
  `name`,
  `description`,
  `address`,
  `pfp_url AS "pfpUrl"`,
  `created_by AS "createdBy"`,
  `created_at AS "createdAt"`,
];

const locationPropsGet = [
  `l.id`,
  `l.name`,
  `l.description`,
  `l.address`,
  `l.pfp_url AS "pfpUrl"`,
  `l.created_by AS "createdBy"`,
  `l.created_at AS "createdAt"`,
  `u.first_name AS "firstName"`,
  `u.last_name AS "lastName"`,
  `u.id AS "userId"`,
];

const locationPropsForUpdateSqlQuery = locationProps.join(", ");
const locationPropsForReadSqlQuery = locationPropsGet.join(", ");

class Location {
  /** Create location with data.
   *
   * Returns { id, name, description, address, pfpUrl, createdBy, createdAt }
   **/
  static async create({ name, description, address, pfpUrl, createdBy }) {
    const result = await db.query(
      `INSERT INTO locations 
                 (name,
                  description, 
                  address,
                  pfp_url,
                  created_by)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING ${locationPropsForUpdateSqlQuery}`,
      [name, description, address, pfpUrl, createdBy]
    );

    const location = result.rows[0];

    return location;
  }

  /** Given an id, return a single location record.
   *
   * Returns { id, name, description, address, pfpUrl, createdBy, createdAt }
   *
   * Throws NotFoundError if location not found.
   **/
  static async get(id, userId) {
    const locationRes = await db.query(`
      SELECT ${locationPropsForReadSqlQuery},
        CASE WHEN ls.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isSaved",
        COALESCE((SELECT COUNT(*) FROM location_reviews AS lr WHERE lr.location_id = l.id), 0) ::integer AS "reviewsCount",
        COALESCE(ROUND((SELECT AVG(rate) FROM location_reviews AS lr WHERE lr.location_id = l.id), 1), 0) AS "avgRating"
      FROM locations AS l
      JOIN users AS u 
        ON l.created_by = u.id
      LEFT JOIN location_saves AS ls
      ON l.id = ls.location_id AND ls.user_id = $1
      WHERE l.id = $2`, [userId, id]);

    const location = locationRes.rows[0];

    if (!location) throw new NotFoundError(`No location found`);

    return location;
  }

  /** Return array of locations.
   *
   * Returns data: [ {id, name, description, address, pfpUrl, createdBy, createdAt}, ...]
   * 
   // filter: 
   - isSaved (returns only the locations which are in Saved)
   **/
  static async getAll({ userId, isSaved }) {
    let query = `SELECT ${locationPropsForReadSqlQuery},
        CASE WHEN ls.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isSaved",
        COALESCE((SELECT COUNT(*) FROM location_reviews AS lr WHERE lr.location_id = l.id), 0) ::integer AS "reviewsCount",
        COALESCE(ROUND((SELECT AVG(rate) FROM location_reviews AS lr WHERE lr.location_id = l.id), 1), 0) AS "avgRating"
      FROM locations AS l
      JOIN users AS u 
        ON l.created_by = u.id
      LEFT JOIN location_saves AS ls
      ON l.id = ls.location_id AND ls.user_id = $1
  `;

    // Add condition for filtering
    if (isSaved === "true") {
      query += " WHERE ls.user_id IS NOT NULL";
    }

    // ordery by avgRating - highest to lowest
    query = query + ' ORDER BY "avgRating" DESC, l.created_at DESC';

    const locationRes = await db.query(query, [userId]);

    const locations = locationRes.rows;

    return locations || [];
  }

  /** Update location data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { name, description, address, pfpUrl }
   *
   * Returns { id, name, description, address, pfpUrl, createdBy, createdAt }
   *
   * Throws NotFoundError if not found.
   */
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      pfpUrl: "pfp_url",
    });

    const querySql = `UPDATE locations
                      SET ${setCols}
                      WHERE id = $${values.length + 1}
                      RETURNING ${locationPropsForUpdateSqlQuery}`;

    const result = await db.query(querySql, [...values, id]);
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
    const querySql = `DELETE FROM locations WHERE id = $1`;

    const result = await db.query(querySql, [id]);

    if (result.rowCount === 0) {
      throw new NotFoundError(`No location found`);
    }
  }
}

module.exports = Location;
