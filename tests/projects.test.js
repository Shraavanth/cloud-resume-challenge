import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock DynamoDB Document Client
const mockSend = vi.fn();
vi.mock("../src/utils/db.js", () => ({
  docClient: {
    send: (...args) => mockSend(...args),
  },
}));

import { handler } from "../src/handlers/projects.js";

describe("Projects Handler Unit Tests", () => {
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

  const studentEvent = {
    requestContext: {
      authorizer: {
        jwt: {
          claims: {
            sub: "student-uuid",
            "cognito:groups": ["Student"],
          },
        },
      },
    },
  };

  test("GET /projects should return all projects with CORS headers", async () => {
    mockSend.mockResolvedValueOnce({
      Items: [
        { projectId: "p1", title: "Cloud Resume", techStack: ["AWS", "React"] },
      ],
    });

    const event = { httpMethod: "GET" };
    const res = await handler(event);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(res.headers["Access-Control-Allow-Origin"]).toBe("*");
    expect(body.projects).toHaveLength(1);
    expect(body.projects[0].title).toBe("Cloud Resume");
  });

  test("GET /projects?search=cloud&tech=AWS should filter projects", async () => {
    mockSend.mockResolvedValueOnce({ Items: [] });

    const event = {
      httpMethod: "GET",
      queryStringParameters: { search: "cloud", tech: "AWS" },
    };
    const res = await handler(event);

    expect(res.statusCode).toBe(200);
    expect(mockSend).toHaveBeenCalled();
  });

  test("GET /projects/{id} should return single project when found", async () => {
    mockSend.mockResolvedValueOnce({
      Item: { projectId: "p1", title: "Cloud Resume" },
    });

    const event = {
      httpMethod: "GET",
      pathParameters: { id: "p1" },
    };
    const res = await handler(event);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.project.projectId).toBe("p1");
  });

  test("GET /projects/{id} should return 404 when project does not exist", async () => {
    mockSend.mockResolvedValueOnce({ Item: null });

    const event = {
      httpMethod: "GET",
      pathParameters: { id: "non-existent" },
    };
    const res = await handler(event);

    expect(res.statusCode).toBe(404);
  });

  test("POST /projects should create project when authenticated as Admin", async () => {
    mockSend.mockResolvedValueOnce({});

    const event = {
      ...adminEvent,
      httpMethod: "POST",
      body: JSON.stringify({
        title: "Serverless Portfolio",
        description: "Built with AWS Lambda & DynamoDB",
        techStack: ["Node.js", "SAM"],
      }),
    };
    const res = await handler(event);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(201);
    expect(body.project.title).toBe("Serverless Portfolio");
    expect(body.project.createdBy).toBe("admin-uuid");
  });

  test("POST /projects should return 401 when unauthenticated", async () => {
    const event = {
      httpMethod: "POST",
      body: JSON.stringify({ title: "New Project", description: "Desc" }),
    };
    const res = await handler(event);

    expect(res.statusCode).toBe(401);
  });

  test("POST /projects should return 403 when authenticated as Student", async () => {
    const event = {
      ...studentEvent,
      httpMethod: "POST",
      body: JSON.stringify({ title: "New Project", description: "Desc" }),
    };
    const res = await handler(event);

    expect(res.statusCode).toBe(403);
  });

  test("POST /projects should return 400 when title or description is missing", async () => {
    const event = {
      ...adminEvent,
      httpMethod: "POST",
      body: JSON.stringify({ title: "Only Title" }),
    };
    const res = await handler(event);

    expect(res.statusCode).toBe(400);
  });

  test("POST /projects should return 400 on malformed JSON body", async () => {
    const event = {
      ...adminEvent,
      httpMethod: "POST",
      body: "{ invalid json",
    };
    const res = await handler(event);

    expect(res.statusCode).toBe(400);
  });

  test("PUT /projects/{id} should update existing project when Admin", async () => {
    mockSend
      .mockResolvedValueOnce({ Item: { projectId: "p1", title: "Old Title" } }) // GetCommand
      .mockResolvedValueOnce({}); // PutCommand

    const event = {
      ...adminEvent,
      httpMethod: "PUT",
      pathParameters: { id: "p1" },
      body: JSON.stringify({ title: "Updated Title" }),
    };
    const res = await handler(event);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.project.title).toBe("Updated Title");
  });

  test("PUT /projects/{id} should return 404 when project not found", async () => {
    mockSend.mockResolvedValueOnce({ Item: null });

    const event = {
      ...adminEvent,
      httpMethod: "PUT",
      pathParameters: { id: "p99" },
      body: JSON.stringify({ title: "Updated" }),
    };
    const res = await handler(event);

    expect(res.statusCode).toBe(404);
  });

  test("DELETE /projects/{id} should delete project when Admin", async () => {
    mockSend
      .mockResolvedValueOnce({ Item: { projectId: "p1" } }) // GetCommand
      .mockResolvedValueOnce({}); // DeleteCommand

    const event = {
      ...adminEvent,
      httpMethod: "DELETE",
      pathParameters: { id: "p1" },
    };
    const res = await handler(event);

    expect(res.statusCode).toBe(200);
  });

  test("DELETE /projects/{id} should return 403 when Student", async () => {
    const event = {
      ...studentEvent,
      httpMethod: "DELETE",
      pathParameters: { id: "p1" },
    };
    const res = await handler(event);

    expect(res.statusCode).toBe(403);
  });

  test("DELETE /projects/{id} should return 404 when project not found", async () => {
    mockSend.mockResolvedValueOnce({ Item: null });

    const event = {
      ...adminEvent,
      httpMethod: "DELETE",
      pathParameters: { id: "p99" },
    };
    const res = await handler(event);

    expect(res.statusCode).toBe(404);
  });

  test("Unsupported method should return 405", async () => {
    const event = { httpMethod: "PATCH" };
    const res = await handler(event);

    expect(res.statusCode).toBe(405);
  });

  test("DynamoDB error should return 500", async () => {
    mockSend.mockRejectedValueOnce(new Error("DynamoDB connection timeout"));

    const event = { httpMethod: "GET" };
    const res = await handler(event);

    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body).message).toBe("Internal server error");
  });
});
