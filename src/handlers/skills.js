import { ScanCommand, PutCommand, DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { docClient } from "../utils/db.js";
import { sendResponse } from "../utils/response.js";
import { requireAdmin } from "../utils/auth.js";

const TABLE_NAME = process.env.SKILLS_TABLE || "Skills";

export const handler = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method || "GET";
  const skillIdParam = event.pathParameters?.id;

  try {
    // 1. GET /skills
    if (method === "GET") {
      if (skillIdParam) {
        const getResult = await docClient.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: { skillId: skillIdParam },
          })
        );
        if (!getResult.Item) {
          return sendResponse(404, { message: `Skill with ID '${skillIdParam}' not found` });
        }
        return sendResponse(200, { skill: getResult.Item });
      }

      const result = await docClient.send(
        new ScanCommand({ TableName: TABLE_NAME })
      );
      return sendResponse(200, { skills: result.Items || [] });
    }

    // 2. POST /skills (Admin only)
    if (method === "POST") {
      const authError = requireAdmin(event);
      if (authError) return authError;

      let body;
      try {
        body = JSON.parse(event.body || "{}");
      } catch {
        return sendResponse(400, { message: "Invalid JSON in request body" });
      }

      if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
        return sendResponse(400, { message: "'name' is a required string field" });
      }

      const proficiency = Number(body.proficiency);
      if (body.proficiency !== undefined && (isNaN(proficiency) || proficiency < 0 || proficiency > 100)) {
        return sendResponse(400, { message: "'proficiency' must be a number between 0 and 100" });
      }

      const skillItem = {
        skillId: uuidv4(),
        name: body.name.trim(),
        category: typeof body.category === "string" && body.category.trim() ? body.category.trim() : "General",
        proficiency: isNaN(proficiency) ? 0 : proficiency,
        createdAt: new Date().toISOString(),
      };

      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: skillItem,
        })
      );

      return sendResponse(201, {
        message: "Skill added successfully",
        skill: skillItem,
      });
    }

    // 3. PUT /skills/{id} (Admin only)
    if (method === "PUT") {
      const authError = requireAdmin(event);
      if (authError) return authError;

      if (!skillIdParam) {
        return sendResponse(400, { message: "Skill ID is required in URL path" });
      }

      const existing = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { skillId: skillIdParam },
        })
      );
      if (!existing.Item) {
        return sendResponse(404, { message: `Skill with ID '${skillIdParam}' not found` });
      }

      let body;
      try {
        body = JSON.parse(event.body || "{}");
      } catch {
        return sendResponse(400, { message: "Invalid JSON in request body" });
      }

      const proficiency = body.proficiency !== undefined ? Number(body.proficiency) : existing.Item.proficiency;
      if (isNaN(proficiency) || proficiency < 0 || proficiency > 100) {
        return sendResponse(400, { message: "'proficiency' must be a number between 0 and 100" });
      }

      const updatedItem = {
        ...existing.Item,
        name: typeof body.name === "string" && body.name.trim() ? body.name.trim() : existing.Item.name,
        category: typeof body.category === "string" && body.category.trim() ? body.category.trim() : existing.Item.category,
        proficiency,
        updatedAt: new Date().toISOString(),
      };

      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: updatedItem,
        })
      );

      return sendResponse(200, {
        message: "Skill updated successfully",
        skill: updatedItem,
      });
    }

    // 4. DELETE /skills/{id} (Admin only)
    if (method === "DELETE") {
      const authError = requireAdmin(event);
      if (authError) return authError;

      if (!skillIdParam) {
        return sendResponse(400, { message: "Skill ID is required in URL path" });
      }

      const existing = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { skillId: skillIdParam },
        })
      );
      if (!existing.Item) {
        return sendResponse(404, { message: `Skill with ID '${skillIdParam}' not found` });
      }

      await docClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { skillId: skillIdParam },
        })
      );

      return sendResponse(200, { message: "Skill deleted successfully" });
    }

    return sendResponse(405, { message: "Method Not Allowed" });
  } catch (error) {
    console.error("Skills API Error:", error);
    return sendResponse(500, {
      message: "Internal server error",
      error: error.message,
    });
  }
};