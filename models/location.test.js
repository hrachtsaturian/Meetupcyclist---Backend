const { NotFoundError } = require("../expressError");
const db = require("../db.js");
const Location = require("./location");

describe("Location Model", () => {
  beforeEach(async () => {
    await db.query("DELETE FROM location_saves");
    await db.query("DELETE FROM location_reviews");
    await db.query("DELETE FROM locations");
    await db.query("ALTER TABLE users DISABLE TRIGGER ALL"); // Disable triggers
    await db.query("DELETE FROM users"); // Delete records
    await db.query("ALTER TABLE users ENABLE TRIGGER ALL"); // Re-enable triggers
  });

  afterAll(async () => {
    await db.end();
  });

  describe("create", () => {
    it("should create a location and return its data", async () => {
      const user = await db.query(`
        INSERT INTO users (first_name, last_name, email, password)
        VALUES ('John', 'Doe', 'john.doe@example.com', 'password')
        RETURNING id
      `);
      const createdUserId = user.rows[0].id;

      const locationData = {
        name: "Test Location",
        description: "A place to test.",
        address: "123 Test St, Test City",
        pfpUrl: "http://example.com/pic.jpg",
        createdBy: createdUserId,
      };

      const location = await Location.create(locationData);

      expect(location).toEqual(
        expect.objectContaining({
          name: locationData.name,
          description: locationData.description,
          address: locationData.address,
          pfpUrl: locationData.pfpUrl,
          createdBy: createdUserId,
        })
      );
    });
  });

  describe("get", () => {
    it("should return a location by its id", async () => {
      const user = await db.query(`
        INSERT INTO users (first_name, last_name, email, password)
        VALUES ('John', 'Doe', 'john.doe@example.com', 'password')
        RETURNING id
      `);
      const createdUserId = user.rows[0].id;

      const locationData = {
        name: "Test Location",
        description: "A place to test.",
        address: "123 Test St, Test City",
        pfpUrl: "http://example.com/pic.jpg",
        createdBy: createdUserId,
      };

      const location = await Location.create(locationData);

      const fetchedLocation = await Location.get(location.id, createdUserId);

      expect(fetchedLocation).toEqual(
        expect.objectContaining({
          id: location.id,
          name: locationData.name,
          description: locationData.description,
          address: locationData.address,
          pfpUrl: locationData.pfpUrl,
          createdBy: createdUserId,
        })
      );
    });

    it("should throw NotFoundError if location is not found", async () => {
      try {
        await Location.get(9999, 1); // Non-existent location
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundError);
      }
    });
  });

  describe("update", () => {
    it("should update location data", async () => {
      const user = await db.query(`
        INSERT INTO users (first_name, last_name, email, password)
        VALUES ('John', 'Doe', 'john.doe@example.com', 'password')
        RETURNING id
      `);
      const createdUserId = user.rows[0].id;

      const locationData = {
        name: "Test Location",
        description: "A place to test.",
        address: "123 Test St, Test City",
        pfpUrl: "http://example.com/pic.jpg",
        createdBy: createdUserId,
      };

      const location = await Location.create(locationData);

      const updateData = {
        name: "Updated Test Location",
        address: "456 Updated St, New City",
      };

      const updatedLocation = await Location.update(location.id, updateData);

      expect(updatedLocation.name).toBe(updateData.name);
      expect(updatedLocation.address).toBe(updateData.address);
    });

    it("should throw NotFoundError if location is not found", async () => {
      try {
        await Location.update(9999, { name: "Non-existent Location" }); // Non-existent location
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundError);
      }
    });
  });

  describe("delete", () => {
    it("should delete a location", async () => {
      const user = await db.query(`
        INSERT INTO users (first_name, last_name, email, password)
        VALUES ('John', 'Doe', 'john.doe@example.com', 'password')
        RETURNING id
      `);
      const createdUserId = user.rows[0].id;

      const locationData = {
        name: "Test Location",
        description: "A place to test.",
        address: "123 Test St, Test City",
        pfpUrl: "http://example.com/pic.jpg",
        createdBy: createdUserId,
      };

      const location = await Location.create(locationData);

      await Location.delete(location.id);

      const result = await db.query(
        `
        SELECT * FROM locations WHERE id = $1`,
        [location.id]
      );

      expect(result.rows.length).toBe(0); // Location should be deleted
    });

    it("should throw NotFoundError if location is not found", async () => {
      try {
        await Location.delete(9999); // Non-existent location
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundError);
      }
    });
  });

  describe("getAll", () => {
    it("should return all locations with isSaved based on user saved locations", async () => {
      const user = await db.query(`
        INSERT INTO users (first_name, last_name, email, password)
        VALUES ('John', 'Doe', 'john.doe@example.com', 'password')
        RETURNING id
      `);
      const createdUserId = user.rows[0].id;

      const location1 = await Location.create({
        name: "Location 1",
        description: "Description 1",
        address: "123 Address 1",
        pfpUrl: "http://example.com/pic1.jpg",
        createdBy: createdUserId,
      });

      await db.query(
        `
        INSERT INTO location_saves (user_id, location_id)
        VALUES ($1, $2)`,
        [createdUserId, location1.id]
      );

      const locations = await Location.getAll({
        userId: createdUserId,
        isSaved: "true",
      });

      expect(locations.length).toBeGreaterThan(0);
      expect(locations[0].isSaved).toBe(true);
    });
  });
});
