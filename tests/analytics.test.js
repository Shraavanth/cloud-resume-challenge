import { describe, test, expect, vi } from "vitest";

// Mock DynamoDB Document Client
vi.mock("../src/utils/db.js", () => ({
  docClient: {
    send: vi.fn().mockResolvedValue({ Attributes: { totalVisits: 5 } }),
  },
}));

import { handler } from "../src/handlers/analytics.js";

describe("Analytics Handler Unit Tests", () => {
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

  test("Unknown path should return 404", async () => {
    const event = {
      httpMethod: "GET",
      path: "/unknown-route",
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(404);
  });
});