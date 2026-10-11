import { sendResponse } from "./response.js";

/**
 * Extracts and parses Cognito JWT claims from API Gateway request context.
 * In AWS API Gateway HTTP APIs with Cognito JWT Authorizer:
 * claims are populated in event.requestContext.authorizer.jwt.claims.
 */
export const getAuthClaims = (event = {}) => {
  const authorizer = event.requestContext?.authorizer;
  const claims = authorizer?.jwt?.claims || authorizer?.claims || null;

  if (!claims) {
    // Check if test headers are supplied in local/test environment
    if (process.env.NODE_ENV === "test" && event.headers?.["x-mock-role"]) {
      const mockRole = event.headers["x-mock-role"];
      const mockUser = event.headers["x-mock-user"] || "test-user-id";
      return {
        isAuthenticated: true,
        userId: mockUser,
        email: `${mockUser}@example.com`,
        groups: [mockRole],
        isAdmin: mockRole === "Admin",
        isStudent: mockRole === "Student",
        claims: { sub: mockUser, "cognito:groups": [mockRole] },
      };
    }

    return {
      isAuthenticated: false,
      userId: null,
      email: null,
      groups: [],
      isAdmin: false,
      isStudent: false,
      claims: null,
    };
  }

  // Normalize cognito:groups claim (can be array, comma-delimited string, or single string)
  let groups = [];
  const rawGroups = claims["cognito:groups"];
  if (Array.isArray(rawGroups)) {
    groups = rawGroups;
  } else if (typeof rawGroups === "string") {
    groups = rawGroups.startsWith("[")
      ? JSON.parse(rawGroups)
      : rawGroups.split(",").map((g) => g.trim());
  }

  const userId = claims.sub || claims["cognito:username"] || claims.username || null;
  const email = claims.email || null;
  const isAdmin = groups.includes("Admin") || claims["custom:role"] === "Admin";
  const isStudent = groups.includes("Student") || (!isAdmin && Boolean(userId));

  return {
    isAuthenticated: true,
    userId,
    email,
    groups,
    isAdmin,
    isStudent,
    claims,
  };
};

/**
 * Enforces that the request has a valid authenticated session.
 * Returns null if allowed, or an HTTP 401 sendResponse object if unauthorized.
 */
export const requireAuth = (event) => {
  const auth = getAuthClaims(event);
  if (!auth.isAuthenticated) {
    return sendResponse(401, {
      message: "Unauthorized: Valid Cognito authentication token required",
    });
  }
  return null;
};

/**
 * Enforces that the request is authenticated with Administrator privileges.
 * Returns null if allowed, or an HTTP 401/403 sendResponse object.
 */
export const requireAdmin = (event) => {
  const auth = getAuthClaims(event);
  if (!auth.isAuthenticated) {
    return sendResponse(401, {
      message: "Unauthorized: Authentication required",
    });
  }
  if (!auth.isAdmin) {
    return sendResponse(403, {
      message: "Forbidden: Administrator privileges required",
    });
  }
  return null;
};

/**
 * Enforces that the authenticated user either owns the resource or is an Administrator.
 * Prevents students from mutating or reading private resources belonging to other students.
 */
export const requireOwnershipOrAdmin = (event, resourceOwnerId) => {
  const auth = getAuthClaims(event);
  if (!auth.isAuthenticated) {
    return sendResponse(401, {
      message: "Unauthorized: Authentication required",
    });
  }
  if (auth.isAdmin) {
    return null;
  }
  if (!resourceOwnerId || auth.userId !== resourceOwnerId) {
    return sendResponse(403, {
      message: "Forbidden: You do not have permission to access this resource",
    });
  }
  return null;
};
