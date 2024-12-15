"use strict";

const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");

const groupPostProps = [
  `id`,
  `user_id AS "userId"`,
  `group_id AS "groupId"`,
  `text`,
  `created_at AS "createdAt"`,
  `updated_at AS "updatedAt"`
];

const groupPostPropsGet = [
  `gp.id`,
  `gp.user_id AS "userId"`,
  `gp.group_id AS "groupId"`,
  `gp.text`,
  `gp.created_at AS "createdAt"`,
  `gp.updated_at AS "updatedAt"`,
  `u.first_name AS "firstName"`,
  `u.last_name AS "lastName"`,
  `u.pfp_url AS "pfpUrl"`,
  `g.name AS "groupName"`,
  `g.created_by AS "groupAdmin"`
];

const groupPostPropsForUpdateSqlQuery = groupPostProps.join(", ");
const groupPostPropsForReadSqlQuery = groupPostPropsGet.join(", ");

class GroupPost {
  /** Create post with data.
   *
   * Returns { id, userId, groupId, text, createdAt, updatedAt }
   **/
  static async create(userId, groupId, text) {
    const query = `INSERT INTO group_posts
                 (user_id,
                  group_id,
                  text)
                 VALUES ($1, $2, $3)
                 RETURNING ${groupPostPropsForUpdateSqlQuery}`;

    const values = [userId, groupId, text];

    const res = await db.query(query, values);
    const groupPost = res.rows[0];

    return groupPost;
  }

  /** Return record of a single post.
   *
   * Returns data: { id, userId, groupId, text, createdAt, updatedAt }
   **/
  static async getById(id) {
    const res = await db.query(
      `SELECT ${groupPostPropsForUpdateSqlQuery}
        FROM group_posts
            WHERE id = ${id}`
    );

    const groupPost = res.rows[0];

    if (!groupPost) throw new NotFoundError(`No post found`);

    return groupPost;
  }

  // get 20 most recent posts from group that user is in 

  static async getRecent(userId) {
    const groupPostRes = await db.query(
      `SELECT ${groupPostPropsForReadSqlQuery}
        FROM group_posts AS gp
            JOIN users AS u
                ON gp.user_id = u.id
            JOIN groups AS g
                ON gp.group_id = g.id
            JOIN group_members AS gm
                ON gp.group_id = gm.group_id
      WHERE gm.user_id = ${userId}
      ORDER BY gp.created_at DESC
      LIMIT 20`
    );

    const groupPosts = groupPostRes.rows;

    return groupPosts || [];
  }

  /** Return array of group posts.
   *
   * Returns data: [ {id, userId, groupId, text, createdAt, updatedAt}, ...]
   **/
  static async getAll(groupId) {
    const groupPostRes = await db.query(
      `SELECT ${groupPostPropsForReadSqlQuery}
        FROM group_posts AS gp
            JOIN users AS u
                ON gp.user_id = u.id
            JOIN groups AS g
                ON gp.group_id = g.id
      WHERE gp.group_id = ${groupId}
      ORDER BY gp.created_at DESC`
    );

    const groupPosts = groupPostRes.rows;

    return groupPosts || [];
  }

  /** Update group post data with `data`.
   *
   * Returns { id, userId, groupId, text, createdAt, updatedAt }
   *
   * Throws NotFoundError if not found.
   */
  static async update(id, text) {
    const querySql = `UPDATE group_posts
                            SET "text"=$1, "updated_at"=$2
                            WHERE id=${id}
                            RETURNING ${groupPostPropsForUpdateSqlQuery}`;

    const result = await db.query(querySql, [text, new Date()]);
    const groupPost = result.rows[0];

    if (!groupPost) throw new NotFoundError(`No post found`);

    return groupPost;
  }

  /** Delete
   *
   *
   * Throws NotFoundError if not found.
   */
  static async delete(id) {
    const querySql = `DELETE FROM group_posts WHERE id = ${id}`;

    const result = await db.query(querySql);

    if (result.rowCount === 0) {
      throw new NotFoundError(`No post found`);
    }
  }
}

module.exports = GroupPost;
