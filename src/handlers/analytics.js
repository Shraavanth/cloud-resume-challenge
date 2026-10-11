import { UpdateCommand, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { docClient } from "../utils/db.js";
import { sendResponse } from "../utils/response.js";

const ANALYTICS_TABLE = process.env.ANALYTICS_TABLE || "VisitorAnalytics";
const RATINGS_TABLE = process.env.RATINGS_TABLE || "PortfolioRatings";

export const handler = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method || "GET";
  const path = event.rawPath || event.path || event.requestContext?.http?.path || "";

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

        const total = result.Attributes?.totalVisits || 1;
        return sendResponse(200, {
          totalVisits: total,
          total: total, // Compatibility with frontend res.data.total
          lastVisit: result.Attributes?.lastVisit,
          lastBrowser: result.Attributes?.lastBrowser,
        });
      }

      // GET: Retrieve visitor stats without incrementing
      if (method === "GET") {
        const result = await docClient.send(
          new GetCommand({
            TableName: ANALYTICS_TABLE,
            Key: { siteId: "main" },
          })
        );
        const total = result.Item?.totalVisits || 0;
        return sendResponse(200, {
          totalVisits: total,
          total: total, // Compatibility with frontend res.data.total
          ...result.Item,
        });
      }

      return sendResponse(405, { message: "Method Not Allowed" });
    }

    // ---------------- PORTFOLIO RATINGS ----------------
    if (path.includes("rating")) {
      // POST: Submit a new rating (1-5)
      if (method === "POST") {
        let body;
        try {
          body = JSON.parse(event.body || "{}");
        } catch {
          return sendResponse(400, { message: "Invalid JSON in request body" });
        }

        // Support both "score" and "rating" property names (frontend sends "rating")
        const rawScore = body.score !== undefined ? body.score : body.rating;
        const score = Number(rawScore);

        if (isNaN(score) || score < 1 || score > 5) {
          return sendResponse(400, { message: "Rating score must be between 1 and 5" });
        }

        const ratingItem = {
          ratingId: uuidv4(),
          score,
          createdAt: new Date().toISOString(),
        };

        await docClient.send(
          new PutCommand({
            TableName: RATINGS_TABLE,
            Item: ratingItem,
          })
        );

        return sendResponse(201, {
          message: "Rating submitted successfully",
          rating: ratingItem,
        });
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
          return sendResponse(200, {
            averageRating: 0,
            avg: 0, // Compatibility with frontend res.data.avg
            totalRatings: 0,
          });
        }

        const sum = items.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
        const averageRating = Number((sum / totalRatings).toFixed(1));

        return sendResponse(200, {
          averageRating,
          avg: averageRating, // Compatibility with frontend res.data.avg
          totalRatings,
        });
      }

      return sendResponse(405, { message: "Method Not Allowed" });
    }

    return sendResponse(404, { message: "Endpoint not found" });
  } catch (error) {
    console.error("Analytics Error:", error);
    return sendResponse(500, { message: "Internal server error", error: error.message });
  }
};