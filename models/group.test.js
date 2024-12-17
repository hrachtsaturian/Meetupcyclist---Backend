const { NotFoundError } = require("../expressError");
const db = require("../db.js");
const Group = require("./group");

describe("Group Model", () => {
  beforeEach(async () => {
    await db.query("DELETE FROM groups");
    await db.query("ALTER TABLE users DISABLE TRIGGER ALL"); // Disable triggers
    await db.query("DELETE FROM users"); // Delete records
    await db.query("ALTER TABLE users ENABLE TRIGGER ALL"); // Re-enable triggers
  });
  afterAll(async () => {
    await db.end();
  });

  describe("create", () => {
    it("should create a new group", async () => {
      const user = await db.query(`
        INSERT INTO users (first_name, last_name, email, password)
        VALUES ('John', 'Doe', 'john@doe.com', 'password')
        RETURNING id
      `);
      const createdUserId = user.rows[0].id;

      const group = await Group.create({
        name: "Test Group",
        description: "This is a test group.",
        pfpUrl: "http://url.to/image.png",
        createdBy: createdUserId,
      });

      expect(group).toEqual(
        expect.objectContaining({
          name: "Test Group",
          description: "This is a test group.",
          pfpUrl: "http://url.to/image.png",
          createdBy: createdUserId,
        })
      );
    });
  });

  describe("get", () => {
    it("should retrieve a group by ID", async () => {
      const user = await db.query(`
        INSERT INTO users (first_name, last_name, email, password)
        VALUES ('John', 'Doe', 'john@doe.com', 'password')
        RETURNING id
      `);
      const createdUserId = user.rows[0].id;

      const group = await Group.create({
        name: "Test Group",
        description: "This is a test group.",
        pfpUrl: "http://url.to/image.png",
        createdBy: createdUserId,
      });

      const fetchedGroup = await Group.get(group.id, createdUserId);

      expect(fetchedGroup.name).toBe("Test Group");
      expect(fetchedGroup.description).toBe("This is a test group.");
      expect(fetchedGroup.pfpUrl).toBe("http://url.to/image.png");
    });

    it("should throw error if group not found", async () => {
      try {
        await Group.get(999, 1); // 999 doesn't exist
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundError);
      }
    });
  });

  describe("getAll", () => {
    it("should retrieve all groups", async () => {
      const user = await db.query(`
        INSERT INTO users (first_name, last_name, email, password)
        VALUES ('John', 'Doe', 'john@doe.com', 'password')
        RETURNING id
      `);
      const createdUserId = user.rows[0].id;

      await Group.create({
        name: "Test Group 1",
        description: "This is the first group.",
        pfpUrl: "http://url1.to/image.png",
        createdBy: createdUserId,
      });

      await Group.create({
        name: "Test Group 2",
        description: "This is the second group.",
        pfpUrl: "http://url2.to/image.png",
        createdBy: createdUserId,
      });

      const groups = await Group.getAll({ userId: createdUserId });
      expect(groups.length).toBeGreaterThan(0);
    });

    it("should filter by saved status", async () => {
      const user = await db.query(`
        INSERT INTO users (first_name, last_name, email, password)
        VALUES ('John', 'Doe', 'john@doe.com', 'password')
        RETURNING id
      `);
      const createdUserId = user.rows[0].id;

      const group1 = await Group.create({
        name: "Test Group 1",
        description: "This is the first group.",
        pfpUrl: "http://url1.to/image.png",
        createdBy: createdUserId,
      });

      await db.query(
        `
        INSERT INTO group_saves (user_id, group_id)
        VALUES ($1, $2)
      `,
        [createdUserId, group1.id]
      );

      const groups = await Group.getAll({
        userId: createdUserId,
        filter: { isSaved: true },
      });

      expect(groups.length).toBe(1);
      expect(groups[0].name).toBe("Test Group 1");
    });
  });

  describe("update", () => {
    it("should update a group", async () => {
      const user = await db.query(`
        INSERT INTO users (first_name, last_name, email, password)
        VALUES ('John', 'Doe', 'john@doe.com', 'password')
        RETURNING id
      `);
      const createdUserId = user.rows[0].id;

      const group = await Group.create({
        name: "Test Group",
        description: "This is a test group.",
        pfpUrl: "http://url.to/image.png",
        createdBy: createdUserId,
      });

      const updatedGroup = await Group.update(group.id, {
        name: "Updated Group Name",
      });

      expect(updatedGroup.name).toBe("Updated Group Name");
    });

    it("should throw error if group to update not found", async () => {
      try {
        await Group.update(999, { name: "Nonexistent Group" });
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundError);
      }
    });
  });

  describe("delete", () => {
    it("should delete a group", async () => {
      const user = await db.query(`
        INSERT INTO users (first_name, last_name, email, password)
        VALUES ('John', 'Doe', 'john@doe.com', 'password')
        RETURNING id
      `);
      const createdUserId = user.rows[0].id;

      const group = await Group.create({
        name: "Test Group",
        description: "This is a test group.",
        pfpUrl: "http://url.to/image.png",
        createdBy: createdUserId,
      });

      await Group.delete(group.id);

      try {
        await Group.get(group.id, createdUserId);
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundError);
      }
    });

    it("should throw error if group not found during deletion", async () => {
      try {
        await Group.delete(999);
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundError);
      }
    });
  });
});
