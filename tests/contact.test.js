import { describe, test, expect, vi } from "vitest";

// 1. Mock DynamoDB
const mockSend = vi.fn().mockResolvedValue({});
vi.mock("../src/utils/db.js", () => ({
  docClient: {
    send: (...args) => mockSend(...args),
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

  test("POST /contact should reject invalid email format", async () => {
    const event = {
      httpMethod: "POST",
      body: JSON.stringify({
        name: "Test User",
        email: "not-an-email",
        message: "Hello world",
      }),
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe("Invalid email format");
  });

  test("POST /contact should successfully save message and return 201", async () => {
    mockSend.mockResolvedValueOnce({});

    const event = {
      httpMethod: "POST",
      body: JSON.stringify({
        name: "Alice",
        email: "alice@example.com",
        message: "Interested in your cloud portfolio project!",
      }),
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(201);
    expect(body.message).toBe("Message sent successfully!");
    expect(body.contactId).toBeDefined();
  });

  test("GET /contact should return contact list when authenticated as Admin", async () => {
    mockSend.mockResolvedValueOnce({
      Items: [
        { contactId: "c1", name: "Alice", email: "alice@example.com", message: "Hi" },
      ],
    });

    const event = {
      httpMethod: "GET",
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: "admin-id",
              "cognito:groups": ["Admin"],
            },
          },
        },
      },
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.contacts).toHaveLength(1);
  });

  test("Non-POST requests should return 405 Method Not Allowed", async () => {
    const event = {
      httpMethod: "GET",
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(405);
  });
});