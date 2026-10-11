import { describe, test, expect, vi, beforeEach } from "vitest";

const mockSend = vi.fn();
vi.mock("../src/utils/db.js", () => ({
  docClient: {
    send: (...args) => mockSend(...args),
  },
}));

import { handler } from "../src/handlers/certifications.js";

describe("Certifications Handler Unit Tests", () => {
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

  test("GET /certifications returns all certifications", async () => {
    mockSend.mockResolvedValueOnce({
      Items: [{ certId: "c1", title: "AWS Solutions Architect", issuer: "AWS" }],
    });

    const res = await handler({ httpMethod: "GET" });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.certifications).toHaveLength(1);
    expect(body.certifications[0].title).toBe("AWS Solutions Architect");
  });

  test("GET /certifications/{id} returns single certification", async () => {
    mockSend.mockResolvedValueOnce({
      Item: { certId: "c1", title: "AWS Solutions Architect", issuer: "AWS" },
    });

    const res = await handler({
      httpMethod: "GET",
      pathParameters: { id: "c1" },
    });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.certification.certId).toBe("c1");
  });

  test("GET /certifications/{id} returns 404 when cert not found", async () => {
    mockSend.mockResolvedValueOnce({ Item: null });

    const res = await handler({
      httpMethod: "GET",
      pathParameters: { id: "c99" },
    });

    expect(res.statusCode).toBe(404);
  });

  test("POST /certifications creates cert when Admin", async () => {
    mockSend.mockResolvedValueOnce({});

    const res = await handler({
      ...adminEvent,
      httpMethod: "POST",
      body: JSON.stringify({
        title: "AWS Certified Developer",
        issuer: "Amazon Web Services",
        verifyUrl: "https://aws.amazon.com/verification",
      }),
    });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(201);
    expect(body.cert.title).toBe("AWS Certified Developer");
  });

  test("POST /certifications returns 401 when unauthenticated", async () => {
    const res = await handler({
      httpMethod: "POST",
      body: JSON.stringify({ title: "AWS Cert", issuer: "AWS" }),
    });

    expect(res.statusCode).toBe(401);
  });

  test("POST /certifications returns 400 when title or issuer missing", async () => {
    const res = await handler({
      ...adminEvent,
      httpMethod: "POST",
      body: JSON.stringify({ title: "AWS Cert" }), // missing issuer
    });

    expect(res.statusCode).toBe(400);
  });

  test("PUT /certifications/{id} updates cert when Admin", async () => {
    mockSend
      .mockResolvedValueOnce({ Item: { certId: "c1", title: "AWS Old", issuer: "AWS" } })
      .mockResolvedValueOnce({});

    const res = await handler({
      ...adminEvent,
      httpMethod: "PUT",
      pathParameters: { id: "c1" },
      body: JSON.stringify({ title: "AWS New" }),
    });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.cert.title).toBe("AWS New");
  });

  test("DELETE /certifications/{id} deletes cert when Admin", async () => {
    mockSend
      .mockResolvedValueOnce({ Item: { certId: "c1" } })
      .mockResolvedValueOnce({});

    const res = await handler({
      ...adminEvent,
      httpMethod: "DELETE",
      pathParameters: { id: "c1" },
    });

    expect(res.statusCode).toBe(200);
  });

  test("DELETE /certifications/{id} returns 404 when cert not found", async () => {
    mockSend.mockResolvedValueOnce({ Item: null });

    const res = await handler({
      ...adminEvent,
      httpMethod: "DELETE",
      pathParameters: { id: "c99" },
    });

    expect(res.statusCode).toBe(404);
  });
});
