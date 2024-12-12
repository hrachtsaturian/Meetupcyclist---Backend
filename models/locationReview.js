"use strict";

const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");

const locationReviewProps = [
    `id`,
    `user_id AS "userId"`,
    `location_id AS "locationId"`,
    `text`,
    `rate`,
    `created_at AS "createdAt"`,
    `updated_at AS "updatedAt"`
];

const locationReviewPropsGet = [
    `lr.id`,
    `lr.user_id AS "userId"`,
    `lr.location_id AS "locationId"`,
    `lr.text`,
    `lr.rate`,
    `lr.created_at AS "createdAt"`,
    `lr.updated_at AS "updatedAt"`,
    `u.first_name AS "firstName"`,
    `u.last_name AS "lastName"`,
    `u.pfp_url AS "pfpUrl"`
];

const locationReviewPropsForUpdateSqlQuery = locationReviewProps.join(", ");
const locationReviewPropsForReadSqlQuery = locationReviewPropsGet.join(", ");

class LocationReview {
    /** Create review with data.
     *
     * Returns { id, userId, locationId, text, rate, createdAt, updatedAt }
     **/
    static async create(userId, locationId, text, rate) {
        const query = `INSERT INTO location_reviews
                 (user_id,
                  location_id,
                  text,
                  rate)
                 VALUES ($1, $2, $3, $4)
                 RETURNING ${locationReviewPropsForUpdateSqlQuery}`;

        const values = [userId, locationId, text, rate];

        const res = await db.query(query, values);
        const locationReview = res.rows[0];

        return locationReview;
    }

    /** Return record of a single review.
     *
     * Returns data: { id, userId, locationId, text, rate, createdAt, updatedAt }
     **/
    static async getById(id) {
        const res = await db.query(
            `SELECT ${locationReviewPropsForUpdateSqlQuery}
        FROM location_reviews
            WHERE id = ${id}`
        );

        const locationReview = res.rows[0];

        if (!locationReview) throw new NotFoundError(`No review found`);

        return locationReview;
    }

    /** Return array of location reviews.
     *
     * Returns data: [ {id, userId, locationId, text, rate, createdAt, updatedAt}, ...]
     **/
    static async getAll(locationId) {
        const locationReviewRes = await db.query(
            `SELECT ${locationReviewPropsForReadSqlQuery}
        FROM location_reviews AS lr
            JOIN users AS u
                ON lr.user_id = u.id
                WHERE lr.location_id = ${locationId}
                ORDER BY lr.created_at DESC`
        );

        const locationReviews = locationReviewRes.rows;

        return locationReviews || [];
    }

    /** Update location review data with `data`.
     *
     * Returns { id, userId, locationId, text, rate, createdAt, updatedAt }
     *
     * Throws NotFoundError if not found.
     */
    static async update(id, text, rate) {
        const querySql = `UPDATE location_reviews
                            SET "text"=$1, "rate"=$2, "updated_at"=$3
                            WHERE id=${id}
                            RETURNING ${locationReviewPropsForUpdateSqlQuery}`;

        const result = await db.query(querySql, [text, rate, new Date()]);
        const locationReview = result.rows[0];

        if (!locationReview) throw new NotFoundError(`No review found`);

        return locationReview;
    }

    /** Delete
     *
     *
     * Throws NotFoundError if not found.
     */
    static async delete(id) {
        const querySql = `DELETE FROM location_reviews WHERE id = ${id}`;

        const result = await db.query(querySql);

        if (result.rowCount === 0) {
            throw new NotFoundError(`No review found`);
        }
    }
}

module.exports = LocationReview;
