const { BadRequestError } = require("../expressError");

/**
 * Given a JS object, tranform it into SQL query substring for an update operation
 * Example:
 * 
 * dataToUpdate: {
 *  firstName: "Harry",
 *  bio: "average person",
 * }
 * 
 * jsToSql: {
 *  firstName: "first_name"
 * }
 * 
 * @param {Object} dataToUpdate - data to update, must contain at least one prop
 * @param {Object} jsToSql - will map JS camel case into sql snake case
 * @returns {Object} { setCols: ['name', 'description'], values: ['john', 'doe'] }
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql={}) {
  const keys = Object.keys(dataToUpdate);

  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Harry', bio: 'average person'} => ['"first_name"=$1', '"bio"=$2']
  const cols = keys.map((colName, idx) => 
      `"${jsToSql?.[colName] || colName}"=$${idx + 1}`,
  );

  // cols=[`"first_name"=$1`, `"bio"=$2`]
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
