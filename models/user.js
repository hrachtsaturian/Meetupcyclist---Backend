"use strict";

const db = require("../db.js");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError.js");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

const userProps = [
  `id`,
  `first_name AS "firstName"`,
  `last_name AS "lastName"`,
  `email`,
  `bio`,
  `pfp_url AS "pfpUrl"`,
  `is_admin AS "isAdmin"`,
  `created_at AS "createdAt"`,
  `deactivated_at AS "deactivatedAt"`,
];

const userPropsSqlQuery = userProps.join(", ");

class User {
  /** authenticate user with email, password.
   *
   * Returns { id, firstName, lastName, email, password, bio, pfpUrl, isAdmin, createdAt }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/
  static async authenticate(email, password) {
    const result = await db.query(
      `SELECT ${userPropsSqlQuery}, password
            FROM users
            WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (user && user.deactivatedAt) {
      throw new UnauthorizedError("User is deactivated");
    }

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** User signup with data.
   *
   * Returns { id, firstName, lastName, email, password, bio, pfpUrl, isAdmin, createdAt }
   *
   * Throws BadRequestError on duplicates.
   **/
  static async signup({ firstName, lastName, email, password, bio, pfpUrl }) {
    // check if there is no duplication
    const duplicateCheck = await db.query(
      `SELECT email 
            FROM users
            WHERE email = $1`,
      [email]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate email: ${email}`);
    }

    // hashing password to store in database
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users 
           (first_name,
            last_name, 
            email,
            password,
            bio,
            pfp_url)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING ${userPropsSqlQuery}`,
      [firstName, lastName, email, hashedPassword, bio, pfpUrl]
    );

    const user = result.rows[0];

    return user;
  }

  /** Given an id, return data about user.
   *
   * Returns { id, firstName, lastName, email, password, bio, pfpUrl, isAdmin, createdAt }
   *
   * Throws NotFoundError if user not found.
   **/
  static async get(id) {
    const userRes = await db.query(
      `SELECT ${userPropsSqlQuery} FROM users WHERE id = $1`,
      [id]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user found`);

    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, email, password, bio, pfpUrl }
   *
   * Returns { id, firstName, lastName, email, bio, pfpUrl, isAdmin, createdAt }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */
  static async update(id, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }
    const { setCols, values } = sqlForPartialUpdate(data, {
      firstName: "first_name",
      lastName: "last_name",
      pfpUrl: "pfp_url",
      // only for admin
      deactivatedAt: "deactivated_at",
    });

    const querySql = `UPDATE users
                      SET ${setCols}
                      WHERE id = $${values.length + 1}
                      RETURNING ${userPropsSqlQuery}`;

    const result = await db.query(querySql, [...values, id]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user found`);

    return user;
  }
}

module.exports = User;
