import { describe, test, expect, vi, beforeEach } from "vitest";

const mockSend = vi.fn();
vi.mock("../src/utils/db.js", () => ({
  docClient: {
    send: (...args) => mockSend(...args),
  },
}));

import { handler } from "../src/handlers/skills.js";

describe("Skills Handler Unit Tests", () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  const adminEvent = {
    requestContext: {
      authorizer: {
        jwt: {
          claims: {
            sub: "admin-uuid",
            "cognito:groups": ["Admin"],
          },
        },
      },
    },
  };

  test("GET /skills returns list of skills", async () => {
    mockSend.mockResolvedValueOnce({
      Items: [{ skillId: "s1", name: "AWS Lambda", proficiency: 90 }],
    });

    const res = await handler({ httpMethod: "GET" });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.skills).toHaveLength(1);
    expect(body.skills[0].name).toBe("AWS Lambda");
  });

  test("POST /skills creates skill when Admin", async () => {
    mockSend.mockResolvedValueOnce({});

    const event = {
      ...adminEvent,
      httpMethod: "POST",
      body: JSON.stringify({ name: "DynamoDB", proficiency: 85, category: "Database" }),
    };
    const res = await handler(event);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(201);
    expect(body.skill.name).toBe("DynamoDB");
    expect(body.skill.proficiency).toBe(85);
  });

  test("POST /skills returns 401 when unauthenticated", async () => {
    const res = await handler({
      httpMethod: "POST",
      body: JSON.stringify({ name: "DynamoDB" }),
    });

    expect(res.statusCode).toBe(401);
  });

  test("POST /skills returns 400 when name is missing or invalid proficiency", async () => {
    const resMissing = await handler({
      ...adminEvent,
      httpMethod: "POST",
      body: JSON.stringify({ proficiency: 80 }),
    });
    expect(resMissing.statusCode).toBe(400);

    const resProf = await handler({
      ...adminEvent,
      httpMethod: "POST",
      body: JSON.stringify({ name: "Docker", proficiency: 150 }),
    });
    expect(resProf.statusCode).toBe(400);
  });

  test("PUT /skills/{id} updates existing skill when Admin", async () => {
    mockSend
      .mockResolvedValueOnce({ Item: { skillId: "s1", name: "AWS", proficiency: 70 } })
      .mockResolvedValueOnce({});

    const res = await handler({
      ...adminEvent,
      httpMethod: "PUT",
      pathParameters: { id: "s1" },
      body: JSON.stringify({ proficiency: 95 }),
    });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.skill.proficiency).toBe(95);
  });

  test("DELETE /skills/{id} deletes skill when Admin", async () => {
    mockSend
      .mockResolvedValueOnce({ Item: { skillId: "s1" } })
      .mockResolvedValueOnce({});

    const res = await handler({
      ...adminEvent,
      httpMethod: "DELETE",
      pathParameters: { id: "s1" },
    });

    expect(res.statusCode).toBe(200);
  });

  test("DELETE /skills/{id} returns 404 when skill not found", async () => {
    mockSend.mockResolvedValueOnce({ Item: null });

    const res = await handler({
      ...adminEvent,
      httpMethod: "DELETE",
      pathParameters: { id: "s99" },
    });

    expect(res.statusCode).toBe(404);
  });

  test("Unsupported method returns 405", async () => {
    const res = await handler({ httpMethod: "PATCH" });
    expect(res.statusCode).toBe(405);
  });
});
