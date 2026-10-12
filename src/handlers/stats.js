import { sendResponse } from "../utils/response.js";

export const handler = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method || "GET";
  const path = event.rawPath || event.path || event.requestContext?.http?.path || "";

  if (method !== "GET") {
    return sendResponse(405, { message: "Method Not Allowed" });
  }

  const username = event.queryStringParameters?.username?.trim();
  if (!username) {
    return sendResponse(400, { message: "Query parameter 'username' is required" });
  }

  const headers = {
    "User-Agent": "CloudResumeChallenge-Backend/1.0",
    Accept: "application/json",
  };

  try {
    // 1. GitHub Statistics
    if (path.includes("github")) {
      const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers,
      });

      if (userRes.status === 404) {
        return sendResponse(404, { message: `GitHub user '${username}' not found` });
      }

      if (userRes.status === 403) {
        return sendResponse(429, {
          message: "GitHub API rate limit exceeded or access forbidden. Please try again later.",
        });
      }

      if (!userRes.ok) {
        return sendResponse(502, {
          message: `Upstream GitHub API returned status ${userRes.status}`,
        });
      }

      const userData = await userRes.json();

      let latestRepo = null;
      try {
        const reposRes = await fetch(
          `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=1`,
          { headers }
        );
        if (reposRes.ok) {
          const reposData = await reposRes.json();
          if (Array.isArray(reposData) && reposData[0]) {
            latestRepo = {
              name: reposData[0].name,
              url: reposData[0].html_url,
              description: reposData[0].description || "",
            };
          }
        }
      } catch (repoErr) {
        console.warn("Could not fetch latest repo:", repoErr.message);
      }

      return sendResponse(200, {
        username,
        followers: userData.followers || 0,
        publicRepos: userData.public_repos || 0,
        avatarUrl: userData.avatar_url || "",
        latestRepo,
      });
    }

    // 2. LeetCode Statistics
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
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables: { username } }),
      });

      if (!response.ok) {
        return sendResponse(502, {
          message: `Upstream LeetCode API returned status ${response.status}`,
        });
      }

      const data = await response.json();

      if (!data.data || !data.data.matchedUser) {
        return sendResponse(404, { message: `LeetCode user '${username}' not found` });
      }

      const matchedUser = data.data.matchedUser;
      return sendResponse(200, {
        username,
        ranking: matchedUser.profile?.ranking || null,
        submissions: matchedUser.submitStatsGlobal?.acSubmissionNum || [],
      });
    }

    return sendResponse(404, { message: "Endpoint not found" });
  } catch (error) {
    console.error("Stats API Error:", error);
    return sendResponse(500, {
      message: "Internal server error fetching statistics",
    });
  }
};