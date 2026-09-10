import { ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { docClient } from "../utils/db.js";
import { sendResponse } from "../utils/response.js";

const TABLE_NAME = process.env.SKILLS_TABLE || "Skills";

export const handler = async (event) => {
  const method = event.httpMethod;

  try {
    // GET /skills
    if (method === "GET") {
      const result = await docClient.send(
        new ScanCommand({ TableName: TABLE_NAME })
      );
      return sendResponse(200, { skills: result.Items || [] });
    }

    // POST /skills
    if (method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const skillItem = {
        skillId: uuidv4(),
        name: body.name,
        category: body.category || "General",
        proficiency: body.proficiency || 0, // e.g. 80 for 80%
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

    // DELETE /skills/{id}
    if (method === "DELETE") {
      const skillId = event.pathParameters?.id;
      await docClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { skillId },
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