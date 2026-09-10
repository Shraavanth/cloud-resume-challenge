import { ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { docClient } from "../utils/db.js";
import { sendResponse } from "../utils/response.js";

const TABLE_NAME = process.env.PROJECTS_TABLE || "Projects";

export const handler = async (event) => {
  const method = event.httpMethod;
  const queryParams = event.queryStringParameters || {};

  try {
    // 1. GET /projects (Handles fetching all and searching/filtering)
    if (method === "GET") {
      const { search, tech } = queryParams;
      let filterExpressions = [];
      let expressionAttributeValues = {};

      if (search) {
        filterExpressions.push("contains(title, :search) OR contains(description, :search)");
        expressionAttributeValues[":search"] = search;
      }
      if (tech) {
        filterExpressions.push("contains(techStack, :tech)");
        expressionAttributeValues[":tech"] = tech;
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

    // 2. POST /projects (Add a new project)
    if (method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const projectItem = {
        projectId: uuidv4(),
        title: body.title,
        description: body.description,
        techStack: body.techStack || [],
        githubUrl: body.githubUrl || "",
        liveUrl: body.liveUrl || "",
        createdAt: new Date().toISOString(),
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

    // 3. DELETE /projects/{id} (Delete a project)
    if (method === "DELETE") {
      const projectId = event.pathParameters?.id;
      await docClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { projectId },
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