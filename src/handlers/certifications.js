import { ScanCommand, PutCommand, DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { docClient } from "../utils/db.js";
import { sendResponse } from "../utils/response.js";
import { requireAdmin } from "../utils/auth.js";

// Check both CERTIFICATIONS_TABLE and CERTS_TABLE (from SAM template Globals)
const TABLE_NAME = process.env.CERTIFICATIONS_TABLE || process.env.CERTS_TABLE || "Certifications";

export const handler = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method || "GET";
  const certIdParam = event.pathParameters?.id;

  try {
    // 1. GET /certifications
    if (method === "GET") {
      if (certIdParam) {
        const getResult = await docClient.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: { certId: certIdParam },
          })
        );
        if (!getResult.Item) {
          return sendResponse(404, { message: `Certification with ID '${certIdParam}' not found` });
        }
        return sendResponse(200, { certification: getResult.Item });
      }

      const result = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
      return sendResponse(200, { certifications: result.Items || [] });
    }

    // 2. POST /certifications (Admin only)
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
      if (!body.issuer || typeof body.issuer !== "string" || !body.issuer.trim()) {
        return sendResponse(400, { message: "'issuer' is a required string field" });
      }

      const certItem = {
        certId: uuidv4(),
        title: body.title.trim(),
        issuer: body.issuer.trim(),
        issueDate: body.issueDate || new Date().toISOString().split("T")[0],
        verifyUrl: typeof body.verifyUrl === "string" ? body.verifyUrl.trim() : "",
        imageUrl: typeof body.imageUrl === "string" ? body.imageUrl.trim() : "",
        createdAt: new Date().toISOString(),
      };

      await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: certItem }));
      return sendResponse(201, { message: "Certification added successfully", cert: certItem });
    }

    // 3. PUT /certifications/{id} (Admin only)
    if (method === "PUT") {
      const authError = requireAdmin(event);
      if (authError) return authError;

      if (!certIdParam) {
        return sendResponse(400, { message: "Certification ID is required in URL path" });
      }

      const existing = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { certId: certIdParam },
        })
      );
      if (!existing.Item) {
        return sendResponse(404, { message: `Certification with ID '${certIdParam}' not found` });
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
        issuer: typeof body.issuer === "string" && body.issuer.trim() ? body.issuer.trim() : existing.Item.issuer,
        issueDate: body.issueDate || existing.Item.issueDate,
        verifyUrl: typeof body.verifyUrl === "string" ? body.verifyUrl.trim() : existing.Item.verifyUrl,
        imageUrl: typeof body.imageUrl === "string" ? body.imageUrl.trim() : existing.Item.imageUrl,
        updatedAt: new Date().toISOString(),
      };

      await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: updatedItem }));
      return sendResponse(200, { message: "Certification updated successfully", cert: updatedItem });
    }

    // 4. DELETE /certifications/{id} (Admin only)
    if (method === "DELETE") {
      const authError = requireAdmin(event);
      if (authError) return authError;

      if (!certIdParam) {
        return sendResponse(400, { message: "Certification ID is required in URL path" });
      }

      const existing = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { certId: certIdParam },
        })
      );
      if (!existing.Item) {
        return sendResponse(404, { message: `Certification with ID '${certIdParam}' not found` });
      }

      await docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { certId: certIdParam } }));
      return sendResponse(200, { message: "Certification deleted successfully" });
    }

    return sendResponse(405, { message: "Method Not Allowed" });
  } catch (error) {
    console.error("Certifications API Error:", error);
    return sendResponse(500, { message: "Internal server error", error: error.message });
  }
};