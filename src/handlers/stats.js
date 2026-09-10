import { sendResponse } from "../utils/response.js";

export const handler = async (event) => {
  const path = event.path || "";
  const username = event.queryStringParameters?.username;

  if (!username) {
    return sendResponse(400, { message: "Query parameter 'username' is required" });
  }

  try {
    // Phase 9: GitHub Statistics
    if (path.includes("github")) {
      const userRes = await fetch(`https://api.github.com/users/${username}`);
      const userData = await userRes.json();

      const reposRes = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=1`
      );
      const reposData = await reposRes.json();

      return sendResponse(200, {
        followers: userData.followers || 0,
        publicRepos: userData.public_repos || 0,
        latestRepo: reposData[0]
          ? {
              name: reposData[0].name,
              url: reposData[0].html_url,
              description: reposData[0].description,
            }
          : null,
      });
    }

    // Phase 10: LeetCode Statistics
    if (path.includes("leetcode")) {
      const query = `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
            profile {
              ranking
            }
          }
        }
      `;

      const response = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: { username } }),
      });

      const data = await response.json();
      return sendResponse(200, data.data?.matchedUser || { message: "User not found" });
    }

    return sendResponse(404, { message: "Endpoint not found" });
  } catch (error) {
    console.error("Stats API Error:", error);
    return sendResponse(500, {
      message: "Internal server error",
      error: error.message,
    });
  }
};