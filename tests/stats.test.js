import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { handler } from "../src/handlers/stats.js";

describe("Stats Handler Unit Tests", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("Missing username query parameter should return 400", async () => {
    const res = await handler({
      httpMethod: "GET",
      path: "/stats/github",
      queryStringParameters: {},
    });

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).message).toContain("username");
  });

  test("GET /stats/github returns user and repo statistics", async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          followers: 42,
          public_repos: 15,
          avatar_url: "https://github.com/avatar.png",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [
          {
            name: "cloud-resume",
            html_url: "https://github.com/user/cloud-resume",
            description: "My cloud portfolio",
          },
        ],
      });

    const res = await handler({
      httpMethod: "GET",
      path: "/stats/github",
      queryStringParameters: { username: "octocat" },
    });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.username).toBe("octocat");
    expect(body.followers).toBe(42);
    expect(body.latestRepo.name).toBe("cloud-resume");
  });

  test("GET /stats/github handles user not found (404)", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const res = await handler({
      httpMethod: "GET",
      path: "/stats/github",
      queryStringParameters: { username: "non-existent-user-12345" },
    });

    expect(res.statusCode).toBe(404);
  });

  test("GET /stats/github handles GitHub rate limits (403)", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
    });

    const res = await handler({
      httpMethod: "GET",
      path: "/stats/github",
      queryStringParameters: { username: "octocat" },
    });

    expect(res.statusCode).toBe(429);
  });

  test("GET /stats/leetcode returns matched user profile", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          matchedUser: {
            profile: { ranking: 125000 },
            submitStatsGlobal: {
              acSubmissionNum: [
                { difficulty: "All", count: 250 },
                { difficulty: "Easy", count: 120 },
              ],
            },
          },
        },
      }),
    });

    const res = await handler({
      httpMethod: "GET",
      path: "/stats/leetcode",
      queryStringParameters: { username: "testcoder" },
    });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.ranking).toBe(125000);
    expect(body.submissions).toHaveLength(2);
  });

  test("GET /stats/leetcode returns 404 when user not found", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: { matchedUser: null },
      }),
    });

    const res = await handler({
      httpMethod: "GET",
      path: "/stats/leetcode",
      queryStringParameters: { username: "fakeuser" },
    });

    expect(res.statusCode).toBe(404);
  });

  test("Non-GET method should return 405 Method Not Allowed", async () => {
    const res = await handler({
      httpMethod: "POST",
      path: "/stats/github",
      queryStringParameters: { username: "octocat" },
    });

    expect(res.statusCode).toBe(405);
  });
});
