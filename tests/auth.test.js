import { describe, test, expect } from "vitest";
import {
  getAuthClaims,
  requireAuth,
  requireAdmin,
  requireOwnershipOrAdmin,
} from "../src/utils/auth.js";

describe("Cognito Authentication & Role Authorization Unit Tests", () => {
  test("Extracts Admin claims correctly from API Gateway authorizer context", () => {
    const event = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: "user-123",
              email: "admin@example.com",
              "cognito:groups": ["Admin"],
            },
          },
        },
      },
    };

    const auth = getAuthClaims(event);
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.isAdmin).toBe(true);
    expect(auth.isStudent).toBe(false);
    expect(auth.userId).toBe("user-123");
    expect(requireAdmin(event)).toBeNull();
    expect(requireAuth(event)).toBeNull();
  });

  test("Extracts Student claims correctly and denies Admin operations", () => {
    const event = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: "student-456",
              email: "student@example.com",
              "cognito:groups": ["Student"],
            },
          },
        },
      },
    };

    const auth = getAuthClaims(event);
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.isAdmin).toBe(false);
    expect(auth.isStudent).toBe(true);

    const adminCheck = requireAdmin(event);
    expect(adminCheck).not.toBeNull();
    expect(adminCheck.statusCode).toBe(403);
  });

  test("Denies unauthenticated access by default", () => {
    const event = {};
    const auth = getAuthClaims(event);

    expect(auth.isAuthenticated).toBe(false);
    expect(auth.isAdmin).toBe(false);

    const authCheck = requireAuth(event);
    expect(authCheck).not.toBeNull();
    expect(authCheck.statusCode).toBe(401);

    const adminCheck = requireAdmin(event);
    expect(adminCheck).not.toBeNull();
    expect(adminCheck.statusCode).toBe(401);
  });

  test("Enforces resource ownership for students while allowing admin override", () => {
    const studentEvent = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: "student-owner",
              "cognito:groups": ["Student"],
            },
          },
        },
      },
    };

    const adminEvent = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: "admin-user",
              "cognito:groups": ["Admin"],
            },
          },
        },
      },
    };

    // Student accessing their own resource
    expect(requireOwnershipOrAdmin(studentEvent, "student-owner")).toBeNull();

    // Student attempting to access another student's resource
    const studentBlocked = requireOwnershipOrAdmin(studentEvent, "different-student");
    expect(studentBlocked).not.toBeNull();
    expect(studentBlocked.statusCode).toBe(403);

    // Admin can access any resource
    expect(requireOwnershipOrAdmin(adminEvent, "different-student")).toBeNull();
  });
});
