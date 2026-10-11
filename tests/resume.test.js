import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock S3 and Request Presigner
vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: vi.fn(function () {}),
  GetObjectCommand: vi.fn(function (params) {
    Object.assign(this, params);
  }),
  PutObjectCommand: vi.fn(function (params) {
    Object.assign(this, params);
  }),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(async (client, command) => {
    return `https://s3.amazonaws.com/portfolio-resumes-12345/resume.pdf?signed=true`;
  }),
}));

process.env.RESUME_BUCKET = "portfolio-resumes-12345";

import { handler } from "../src/handlers/resume.js";

describe("Resume Handler Unit Tests", () => {
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

  test("GET /resume/download should generate a presigned download URL", async () => {
    const res = await handler({ httpMethod: "GET" });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.downloadUrl).toContain("https://s3.amazonaws.com");
    expect(body.expiresIn).toBe(300);
  });

  test("POST /resume/upload should generate presigned PUT upload URL when Admin", async () => {
    const event = {
      ...adminEvent,
      httpMethod: "POST",
    };
    const res = await handler(event);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.uploadUrl).toBeDefined();
    expect(body.key).toBe("resume.pdf");
  });

  test("POST /resume/upload should return 401 when unauthenticated", async () => {
    const res = await handler({ httpMethod: "POST" });
    expect(res.statusCode).toBe(401);
  });

  test("POST /resume/upload should return 403 when user is Student", async () => {
    const res = await handler({
      httpMethod: "POST",
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: "student-1",
              "cognito:groups": ["Student"],
            },
          },
        },
      },
    });
    expect(res.statusCode).toBe(403);
  });

  test("DELETE method should return 405 Method Not Allowed", async () => {
    const res = await handler({ httpMethod: "DELETE" });
    expect(res.statusCode).toBe(405);
  });
});
