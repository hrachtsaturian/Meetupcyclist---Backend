const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", () => {
  test("should throw No data error", () => {
    const dataToUpdate = {};

    const jsToSql = {
      firstName: "first_name",
    };

    expect(() => sqlForPartialUpdate(dataToUpdate, jsToSql)).toThrow("No data");
  });

  test("should return updated cols with values", () => {
    const dataToUpdate = {
      firstName: "Max",
      lastName: "Verstappen",
      bio: "Formula One World Champion",
    };

    const jsToSql = {
      firstName: "first_name",
    };

    expect(sqlForPartialUpdate(dataToUpdate, jsToSql)).toEqual({
      setCols: "\"first_name\"=$1, \"last_name\"=$2, \"bio\"=$3",
      values: ["Max", "Verstappen", "Formula One World Champion"]
    })
  });
});
