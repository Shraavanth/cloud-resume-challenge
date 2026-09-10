import { describe, test, expect, vi } from "vitest";

// 1. Mock DynamoDB
vi.mock("../src/utils/db.js", () => ({
  docClient: {
    send: vi.fn().mockResolvedValue({}),
  },
}));

// 2. Mock SES Client using a standard function (constructor-compatible)
vi.mock("@aws-sdk/client-ses", () => ({
  SESClient: vi.fn(function () {
    this.send = vi.fn().mockResolvedValue({});
  }),
  SendEmailCommand: vi.fn(),
}));

import { handler } from "../src/handlers/contact.js";

describe("Contact Handler Unit Tests", () => {
  test("POST /contact should reject requests with missing fields", async () => {
    const event = {
      httpMethod: "POST",
      body: JSON.stringify({
        name: "Test User",
      }),
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(body.message).toContain("required fields");
  });

  test("Non-POST requests should return 405 Method Not Allowed", async () => {
    const event = {
      httpMethod: "GET",
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(405);
  });
});