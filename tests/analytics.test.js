import { describe, test, expect, vi, beforeEach } from "vitest";

const mockSend = vi.fn();
vi.mock("../src/utils/db.js", () => ({
  docClient: {
    send: (...args) => mockSend(...args),
  },
}));

import { handler } from "../src/handlers/analytics.js";

describe("Analytics Handler Unit Tests", () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  test("POST /visitor should increment and return visitor count", async () => {
    mockSend.mockResolvedValueOnce({
      Attributes: {
        totalVisits: 42,
        lastVisit: "2026-10-10T12:00:00.000Z",
        lastBrowser: "Mozilla/5.0",
      },
    });

    const event = {
      httpMethod: "POST",
      path: "/visitor",
      headers: { "user-agent": "Mozilla/5.0" },
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.totalVisits).toBe(42);
    expect(body.total).toBe(42); // Frontend compatibility
  });

  test("GET /visitor should retrieve current visitor count without incrementing", async () => {
    mockSend.mockResolvedValueOnce({
      Item: { siteId: "main", totalVisits: 100 },
    });

    const event = {
      httpMethod: "GET",
      path: "/visitor",
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.totalVisits).toBe(100);
    expect(body.total).toBe(100);
  });

  test("POST /rating should submit valid rating score", async () => {
    mockSend.mockResolvedValueOnce({});

    const event = {
      httpMethod: "POST",
      path: "/rating",
      body: JSON.stringify({ score: 5 }),
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(201);
  });

  test("POST /rating should accept 'rating' property from frontend", async () => {
    mockSend.mockResolvedValueOnce({});

    const event = {
      httpMethod: "POST",
      path: "/rating",
      body: JSON.stringify({ rating: 4 }),
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(201);
  });

  test("POST /rating should reject scores greater than 5", async () => {
    const event = {
      httpMethod: "POST",
      path: "/rating",
      body: JSON.stringify({ score: 6 }),
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(body.message).toBe("Rating score must be between 1 and 5");
  });

  test("POST /rating should reject scores less than 1", async () => {
    const event = {
      httpMethod: "POST",
      path: "/rating",
      body: JSON.stringify({ score: 0 }),
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(body.message).toBe("Rating score must be between 1 and 5");
  });

  test("GET /rating should calculate average rating and return avg compatibility", async () => {
    mockSend.mockResolvedValueOnce({
      Items: [{ score: 4 }, { score: 5 }, { score: 5 }],
    });

    const event = {
      httpMethod: "GET",
      path: "/rating",
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.averageRating).toBe(4.7);
    expect(body.avg).toBe(4.7); // Frontend compatibility
    expect(body.totalRatings).toBe(3);
  });

  test("PUT /visitor should return 405 Method Not Allowed", async () => {
    const event = {
      httpMethod: "PUT",
      path: "/visitor",
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(405);
  });

  test("Unknown path should return 404", async () => {
    const event = {
      httpMethod: "GET",
      path: "/unknown-route",
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(404);
  });
});