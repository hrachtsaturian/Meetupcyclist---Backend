"use strict";

const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");

const groupEventProps = [
  `event_id AS "eventId"`,
  `group_id AS "groupId"`,
  `created_at AS "createdAt"`,
];

const groupEventPropsForUpdateSqlQuery = groupEventProps.join(", ");

class GroupEvent {
  /** Get array of events of a single group.
   *
   * Returns [{ eventId, groupId, createdAt }, ...]
   **/
  static async get(groupId) {
    const result = await db.query(
      `SELECT ${groupEventPropsForUpdateSqlQuery} FROM group_events WHERE group_id=$1`,
      [groupId]
    );
    const groupEvents = result.rows;

    return groupEvents;
  }

  /** Attach event with data to group.
   *
   * Returns { eventId, groupId, createdAt }
   **/
  static async add(eventId, groupId) {
    const query = `INSERT INTO group_events
                 (event_id,
                  group_id)
                 VALUES ($1, $2)
                 RETURNING ${groupEventPropsForUpdateSqlQuery}`;

    const values = [eventId, groupId];

    const result = await db.query(query, values);
    const groupEvent = result.rows[0];

    return groupEvent;
  }

  /** Delete
   *
   *
   * Throws NotFoundError if not found.
   */
  static async remove(eventId, groupId) {
    const querySql = `DELETE FROM group_events WHERE event_id = $1 AND group_id = $2`;
    const values = [eventId, groupId];

    const result = await db.query(querySql, values);

    if (result.rowCount === 0) {
      throw new NotFoundError(`No group event found`);
    }
  }
}

module.exports = GroupEvent;
