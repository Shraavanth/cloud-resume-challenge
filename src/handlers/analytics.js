import { UpdateCommand, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { docClient } from "../utils/db.js";
import { sendResponse } from "../utils/response.js";

const ANALYTICS_TABLE = process.env.ANALYTICS_TABLE || "VisitorAnalytics";
const RATINGS_TABLE = process.env.RATINGS_TABLE || "PortfolioRatings";

export const handler = async (event) => {
  const method = event.httpMethod;
  const path = event.path || "";

  try {
    // ---------------- VISITOR ANALYTICS ----------------
    if (path.includes("visitor")) {
      // POST: Increment visitor counter
      if (method === "POST") {
        const userAgent =
          event.headers?.["User-Agent"] ||
          event.headers?.["user-agent"] ||
          "Unknown";

        const result = await docClient.send(
          new UpdateCommand({
            TableName: ANALYTICS_TABLE,
            Key: { siteId: "main" },
            UpdateExpression: "ADD totalVisits :inc SET lastVisit = :now, lastBrowser = :ua",
            ExpressionAttributeValues: {
              ":inc": 1,
              ":now": new Date().toISOString(),
              ":ua": userAgent,
            },
            ReturnValues: "UPDATED_NEW",
          })
        );
        return sendResponse(200, result.Attributes);
      }

      // GET: Retrieve visitor stats without incrementing
      if (method === "GET") {
        const result = await docClient.send(
          new GetCommand({
            TableName: ANALYTICS_TABLE,
            Key: { siteId: "main" },
          })
        );
        return sendResponse(200, result.Item || { totalVisits: 0 });
      }
    }

    // ---------------- PORTFOLIO RATINGS ----------------
    if (path.includes("rating")) {
      // POST: Submit a new rating (1-5)
      if (method === "POST") {
        const { score } = JSON.parse(event.body || "{}");
        if (!score || score < 1 || score > 5) {
          return sendResponse(400, { message: "Rating score must be between 1 and 5" });
        }

        const ratingItem = {
          ratingId: uuidv4(),
          score: Number(score),
          createdAt: new Date().toISOString(),
        };

        await docClient.send(
          new PutCommand({
            TableName: RATINGS_TABLE,
            Item: ratingItem,
          })
        );

        return sendResponse(201, { message: "Rating submitted successfully" });
      }

      // GET: Calculate and return average rating & total reviews
      if (method === "GET") {
        const result = await docClient.send(
          new ScanCommand({
            TableName: RATINGS_TABLE,
            ProjectionExpression: "score",
          })
        );

        const items = result.Items || [];
        const totalRatings = items.length;

        if (totalRatings === 0) {
          return sendResponse(200, { averageRating: 0, totalRatings: 0 });
        }

        const sum = items.reduce((acc, curr) => acc + (curr.score || 0), 0);
        const averageRating = Number((sum / totalRatings).toFixed(1));

        return sendResponse(200, { averageRating, totalRatings });
      }
    }

    return sendResponse(404, { message: "Endpoint not found" });
  } catch (error) {
    console.error("Analytics Error:", error);
    return sendResponse(500, { message: "Internal server error", error: error.message });
  }
};