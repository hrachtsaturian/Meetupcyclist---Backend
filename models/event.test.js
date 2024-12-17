const Event = require("../models/event");
const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

jest.mock("../db", () => ({
  query: jest.fn(), // Mock db.query
  end: jest.fn().mockResolvedValue(), // Mock db.end as a no-op Promise
}));
jest.mock("../helpers/sql", () => ({
  sqlForPartialUpdate: jest.fn(),
}));

describe("Event Model", () => {
  afterAll(async () => {
    await db.end();
  });

  describe("create", () => {
    it("creates a new event", async () => {
      const newEvent = {
        title: "Test Event",
        description: "Test description",
        date: "2024-12-15T00:00:00.000Z",
        location: "Test location",
        pfpUrl: "https://example.com/pfp.png",
        createdBy: 1,
      };

      db.query.mockResolvedValue({
        rows: [
          {
            id: 1,
            ...newEvent,
          },
        ],
      });

      const event = await Event.create(newEvent);

      expect(event).toEqual({
        id: 1,
        ...newEvent,
      });
    });
  });

  describe("get", () => {
    it("retrieves event by id", async () => {
      const eventId = 1;
      const userId = 1;

      db.query.mockResolvedValue({
        rows: [
          {
            id: eventId,
            title: "Test Event",
            description: "Test description",
            date: "2024-12-15T00:00:00.000Z",
            location: "Test location",
            pfpUrl: "https://example.com/pfp.png",
            createdBy: 1,
            createdAt: "2024-12-14T00:00:00.000Z",
            firstName: "Test",
            lastName: "User",
            userId,
            isSaved: false,
            isAttending: false,
            attendeesCount: 0,
          },
        ],
      });

      const event = await Event.get(eventId, userId);

      expect(event).toHaveProperty("id", eventId);
      expect(event.title).toEqual("Test Event");
    });

    it("throws NotFoundError if event is not found", async () => {
      const eventId = 999;
      db.query.mockResolvedValue({ rows: [] });

      await expect(Event.get(eventId, 1)).rejects.toThrowError(NotFoundError);
    });
  });

  describe("update", () => {
    it("updates an event with partial data", async () => {
      const eventId = 1;
      const dataToUpdate = { title: "Updated Event", location: "New Location" };

      const mockSqlResult = {
        setCols: '"title"=$1, "location"=$2',
        values: ["Updated Event", "New Location"],
      };
      sqlForPartialUpdate.mockReturnValue(mockSqlResult);

      db.query.mockResolvedValue({
        rows: [
          {
            id: eventId,
            title: "Updated Event",
            description: "Test description",
            date: "2024-12-15T00:00:00.000Z",
            location: "New Location",
            pfpUrl: "https://example.com/pfp.png",
            createdBy: 1,
            createdAt: "2024-12-14T00:00:00.000Z",
          },
        ],
      });

      const updatedEvent = await Event.update(eventId, dataToUpdate);

      expect(updatedEvent).toEqual({
        id: eventId,
        title: "Updated Event",
        description: "Test description",
        date: "2024-12-15T00:00:00.000Z",
        location: "New Location",
        pfpUrl: "https://example.com/pfp.png",
        createdBy: 1,
        createdAt: "2024-12-14T00:00:00.000Z",
      });
    });

    it("throws NotFoundError if the event doesn't exist", async () => {
      const eventId = 999;
      const dataToUpdate = { title: "Updated Event" };

      db.query.mockResolvedValue({ rows: [] });

      await expect(Event.update(eventId, dataToUpdate)).rejects.toThrowError(
        NotFoundError
      );
    });
  });

  describe("delete", () => {
    it("deletes the event successfully", async () => {
      const eventId = 1;

      db.query.mockResolvedValue({ rowCount: 1 });

      await expect(Event.delete(eventId)).resolves.toBeUndefined();
    });

    it("throws NotFoundError if event is not found", async () => {
      const eventId = 999;

      db.query.mockResolvedValue({ rowCount: 0 });

      await expect(Event.delete(eventId)).rejects.toThrowError(NotFoundError);
    });
  });

  describe("getAll", () => {
    it("retrieves events with filters applied", async () => {
      const userId = 1;

      const filters = { isSaved: true, isAttending: false };
      const sort = { date: "ASC" };

      db.query.mockResolvedValue({
        rows: [
          {
            id: 1,
            title: "Test Event",
            description: "Test description",
            date: "2024-12-15T00:00:00.000Z",
            location: "Test location",
            pfpUrl: "https://example.com/pfp.png",
            createdBy: 1,
            createdAt: "2024-12-14T00:00:00.000Z",
            isSaved: true,
            isAttending: false,
            attendeesCount: 0,
          },
        ],
      });

      const events = await Event.getAll({ userId, filter: filters, sort });

      expect(events).toHaveLength(1);
      expect(events[0].title).toEqual("Test Event");
    });
  });
});
