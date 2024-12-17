const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", () => {
  test("should generate correct SQL update query and values when mappings exist", () => {
    const dataToUpdate = {
      firstName: "John",
      bio: "average person",
    };

    const jsToSql = {
      firstName: "first_name",
    };

    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: '"first_name"=$1, "bio"=$2',
      values: ["John", "average person"],
    });
  });

  test("should use default column names when no jsToSql mapping is provided", () => {
    const dataToUpdate = {
      firstName: "Harry",
      lastName: "Potter",
    };

    const result = sqlForPartialUpdate(dataToUpdate);

    expect(result).toEqual({
      setCols: '"firstName"=$1, "lastName"=$2',
      values: ["Harry", "Potter"],
    });
  });

  test("should throw BadRequestError if no data is provided", () => {
    const dataToUpdate = {};

    expect(() => {
      sqlForPartialUpdate(dataToUpdate);
    }).toThrow(BadRequestError);
  });

  test("should handle jsToSql with undefined mappings", () => {
    const dataToUpdate = {
      firstName: "John",
      email: "john@example.com",
    };

    const jsToSql = {
      firstName: "first_name",
    };

    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: '"first_name"=$1, "email"=$2',
      values: ["John", "john@example.com"],
    });
  });

  test("should handle a single field to update", () => {
    const dataToUpdate = {
      bio: "New bio",
    };

    const result = sqlForPartialUpdate(dataToUpdate);

    expect(result).toEqual({
      setCols: '"bio"=$1',
      values: ["New bio"],
    });
  });
});
