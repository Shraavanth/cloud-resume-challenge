import { ScanCommand, PutCommand, DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { docClient } from "../utils/db.js";
import { sendResponse } from "../utils/response.js";
import { requireAdmin, getAuthClaims } from "../utils/auth.js";

const TABLE_NAME = process.env.PROJECTS_TABLE || "Projects";

export const handler = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method || "GET";
  const queryParams = event.queryStringParameters || {};
  const projectIdParam = event.pathParameters?.id;

  try {
    // 1. GET /projects and GET /projects/{id}
    if (method === "GET") {
      // If a specific projectId is requested
      if (projectIdParam) {
        const getResult = await docClient.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: { projectId: projectIdParam },
          })
        );

        if (!getResult.Item) {
          return sendResponse(404, { message: `Project with ID '${projectIdParam}' not found` });
        }

        return sendResponse(200, { project: getResult.Item });
      }

      // Fetch all projects with optional query filtering
      const { search, tech } = queryParams;
      let filterExpressions = [];
      let expressionAttributeValues = {};

      if (search && search.trim()) {
        filterExpressions.push("(contains(title, :search) OR contains(description, :search))");
        expressionAttributeValues[":search"] = search.trim();
      }
      if (tech && tech.trim()) {
        filterExpressions.push("contains(techStack, :tech)");
        expressionAttributeValues[":tech"] = tech.trim();
      }

      const scanParams = {
        TableName: TABLE_NAME,
        ...(filterExpressions.length > 0 && {
          FilterExpression: filterExpressions.join(" AND "),
          ExpressionAttributeValues: expressionAttributeValues,
        }),
      };

      const result = await docClient.send(new ScanCommand(scanParams));
      return sendResponse(200, { projects: result.Items || [] });
    }

    // 2. POST /projects (Admin only: Add new project)
    if (method === "POST") {
      const authError = requireAdmin(event);
      if (authError) return authError;

      let body;
      try {
        body = JSON.parse(event.body || "{}");
      } catch {
        return sendResponse(400, { message: "Invalid JSON in request body" });
      }

      if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
        return sendResponse(400, { message: "'title' is a required string field" });
      }
      if (!body.description || typeof body.description !== "string" || !body.description.trim()) {
        return sendResponse(400, { message: "'description' is a required string field" });
      }

      const claims = getAuthClaims(event);
      const now = new Date().toISOString();
      const projectItem = {
        projectId: uuidv4(),
        title: body.title.trim(),
        description: body.description.trim(),
        techStack: Array.isArray(body.techStack) ? body.techStack : [],
        githubUrl: typeof body.githubUrl === "string" ? body.githubUrl.trim() : "",
        liveUrl: typeof body.liveUrl === "string" ? body.liveUrl.trim() : "",
        createdAt: now,
        updatedAt: now,
        createdBy: claims.userId || "admin",
      };

      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: projectItem,
        })
      );

      return sendResponse(201, {
        message: "Project created successfully",
        project: projectItem,
      });
    }

    // 3. PUT /projects/{id} (Admin only: Update an existing project)
    if (method === "PUT") {
      const authError = requireAdmin(event);
      if (authError) return authError;

      if (!projectIdParam) {
        return sendResponse(400, { message: "Project ID is required in URL path" });
      }

      // Check if project exists
      const existing = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { projectId: projectIdParam },
        })
      );

      if (!existing.Item) {
        return sendResponse(404, { message: `Project with ID '${projectIdParam}' not found` });
      }

      let body;
      try {
        body = JSON.parse(event.body || "{}");
      } catch {
        return sendResponse(400, { message: "Invalid JSON in request body" });
      }

      const updatedItem = {
        ...existing.Item,
        title: typeof body.title === "string" && body.title.trim() ? body.title.trim() : existing.Item.title,
        description: typeof body.description === "string" && body.description.trim() ? body.description.trim() : existing.Item.description,
        techStack: Array.isArray(body.techStack) ? body.techStack : existing.Item.techStack,
        githubUrl: typeof body.githubUrl === "string" ? body.githubUrl.trim() : existing.Item.githubUrl,
        liveUrl: typeof body.liveUrl === "string" ? body.liveUrl.trim() : existing.Item.liveUrl,
        updatedAt: new Date().toISOString(),
      };

      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: updatedItem,
        })
      );

      return sendResponse(200, {
        message: "Project updated successfully",
        project: updatedItem,
      });
    }

    // 4. DELETE /projects/{id} (Admin only: Delete a project)
    if (method === "DELETE") {
      const authError = requireAdmin(event);
      if (authError) return authError;

      if (!projectIdParam) {
        return sendResponse(400, { message: "Project ID is required in URL path" });
      }

      // Check if project exists before deleting
      const existing = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { projectId: projectIdParam },
        })
      );

      if (!existing.Item) {
        return sendResponse(404, { message: `Project with ID '${projectIdParam}' not found` });
      }

      await docClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { projectId: projectIdParam },
        })
      );

      return sendResponse(200, { message: "Project deleted successfully" });
    }

    return sendResponse(405, { message: "Method Not Allowed" });
  } catch (error) {
    console.error("Projects API Error:", error);
    return sendResponse(500, {
      message: "Internal server error",
      error: error.message,
    });
  }
};