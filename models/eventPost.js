"use strict";

const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");

const eventPostProps = [
    `id`,
    `user_id AS "userId"`,
    `event_id AS "eventId"`,
    `text`,
    `created_at AS "createdAt"`,
    `updated_at AS "updatedAt"`
];

const eventPostPropsGet = [
    `ep.id`,
    `ep.user_id AS "userId"`,
    `ep.event_id AS "eventId"`,
    `ep.text`,
    `ep.created_at AS "createdAt"`,
    `ep.updated_at AS "updatedAt"`,
    `u.first_name AS "firstName"`,
    `u.last_name AS "lastName"`,
    `u.pfp_url AS "pfpUrl"`,
    `e.created_by AS "createdBy"`
];

const eventPostPropsForUpdateSqlQuery = eventPostProps.join(", ");
const eventPostPropsForReadSqlQuery = eventPostPropsGet.join(", ");

class EventPost {
    /** Create post with data.
     *
     * Returns { id, userId, eventId, text, createdAt, updatedAt }
     **/
    static async create(userId, eventId, text) {
        const query = `INSERT INTO event_posts
                 (user_id,
                  event_id,
                  text)
                 VALUES ($1, $2, $3)
                 RETURNING ${eventPostPropsForUpdateSqlQuery}`;

        const values = [userId, eventId, text];

        const res = await db.query(query, values);
        const eventPost = res.rows[0];

        return eventPost;
    }

    /** Return record of a single post.
     *
     * Returns data: { id, userId, eventId, text, createdAt, updatedAt }
     **/
    static async getById(id) {
        const res = await db.query(
            `SELECT ${eventPostPropsForUpdateSqlQuery}
        FROM event_posts
            WHERE id = ${id}`
        );

        const eventPost = res.rows[0];

        if (!eventPost) throw new NotFoundError(`No post found`);

        return eventPost;
    }

    /** Return array of event posts.
     *
     * Returns data: [ {id, userId, eventId, text, createdAt, updatedAt}, ...]
     **/
    static async getAll(eventId) {
        const eventPostRes = await db.query(
            `SELECT ${eventPostPropsForReadSqlQuery}
        FROM event_posts AS ep
            JOIN users AS u
                ON ep.user_id = u.id
            JOIN events AS e
                ON ep.event_id = e.id
                WHERE ep.event_id = ${eventId}
                ORDER BY ep.created_at DESC`
        );

        const eventPosts = eventPostRes.rows;

        return eventPosts || [];
    }

    /** Update event post data with `data`.
     *
     * Returns { id, userId, eventId, text, createdAt, updatedAt }
     *
     * Throws NotFoundError if not found.
     */
    static async update(id, text) {
        const querySql = `UPDATE event_posts
                            SET "text"=$1, "updated_at"=$2
                            WHERE id=${id}
                            RETURNING ${eventPostPropsForUpdateSqlQuery}`;

        const result = await db.query(querySql, [text, new Date()]);
        const eventPost = result.rows[0];

        if (!eventPost) throw new NotFoundError(`No post found`);

        return eventPost;
    }

    /** Delete
     *
     *
     * Throws NotFoundError if not found.
     */
    static async delete(id) {
        const querySql = `DELETE FROM event_posts WHERE id = ${id}`;

        const result = await db.query(querySql);

        if (result.rowCount === 0) {
            throw new NotFoundError(`No post found`);
        }
    }
}

module.exports = EventPost;
