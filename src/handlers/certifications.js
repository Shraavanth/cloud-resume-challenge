import { ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { docClient } from "../utils/db.js";
import { sendResponse } from "../utils/response.js";

const TABLE_NAME = process.env.CERTIFICATIONS_TABLE || "Certifications";

export const handler = async (event) => {
  const method = event.httpMethod;

  try {
    if (method === "GET") {
      const result = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
      return sendResponse(200, { certifications: result.Items || [] });
    }

    if (method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const certItem = {
        certId: uuidv4(),
        title: body.title,
        issuer: body.issuer,
        issueDate: body.issueDate,
        verifyUrl: body.verifyUrl || "",
        imageUrl: body.imageUrl || "",
        createdAt: new Date().toISOString()
      };

      await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: certItem }));
      return sendResponse(201, { message: "Certification added", cert: certItem });
    }

    if (method === "DELETE") {
      const certId = event.pathParameters?.id;
      await docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { certId } }));
      return sendResponse(200, { message: "Certification deleted" });
    }

    return sendResponse(405, { message: "Method Not Allowed" });
  } catch (error) {
    console.error("Certifications API Error:", error);
    return sendResponse(500, { message: "Internal server error", error: error.message });
  }
};