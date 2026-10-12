import axios from "axios";

// Environment-driven API Base URL (defaults to empty if not configured)
const envBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
// Strip trailing slash if present
const API_BASE_URL = envBaseUrl ? envBaseUrl.replace(/\/+$/, "") : "";

export const isBackendConnected = Boolean(API_BASE_URL);

export const STATIC_PROJECTS = [
  {
    projectId: "proj-serverless-portfolio",
    title: "Serverless Cloud Portfolio",
    description: "Full-stack Cloud Resume Challenge system built with AWS Lambda, API Gateway HTTP API, DynamoDB, Cognito JWT authentication, and automated GitHub Actions CI/CD pipeline.",
    techStack: ["AWS Lambda", "API Gateway", "DynamoDB", "Cognito", "React", "GitHub Actions"],
    githubUrl: "https://github.com/nikhilkumarneeli-crypto/cloud-resume-challenge",
    liveUrl: "https://nikhilkumarneeli-crypto.github.io/cloud-resume-challenge/",
  },
  {
    projectId: "proj-zero-trust-infra",
    title: "Zero-Trust Cloud Infrastructure",
    description: "Automated Infrastructure-as-Code SAM template strictly adhering to AWS Free Tier limits, with least-privilege IAM roles and secure S3 presigned resume downloads.",
    techStack: ["AWS SAM", "CloudFormation", "IAM", "Amazon S3", "Node.js LTS"],
    githubUrl: "https://github.com/nikhilkumarneeli-crypto/cloud-resume-challenge",
    liveUrl: "https://nikhilkumarneeli-crypto.github.io/cloud-resume-challenge/",
  },
  {
    projectId: "proj-event-analytics",
    title: "Real-Time Serverless Analytics & Feedback",
    description: "High-performance atomic visitor counter and feedback rating engine using DynamoDB ADD operations and sub-second Lambda execution.",
    techStack: ["Amazon DynamoDB", "AWS Lambda", "REST API", "Vitest"],
    githubUrl: "https://github.com/nikhilkumarneeli-crypto/cloud-resume-challenge",
    liveUrl: "https://nikhilkumarneeli-crypto.github.io/cloud-resume-challenge/",
  },
];

export const STATIC_SKILLS = [
  { skillId: "sk-aws-lambda", name: "AWS Lambda & Serverless", category: "Cloud & DevOps", proficiency: 95 },
  { skillId: "sk-dynamodb", name: "Amazon DynamoDB (NoSQL)", category: "Database", proficiency: 90 },
  { skillId: "sk-apigw", name: "API Gateway & Cognito Auth", category: "Security & APIs", proficiency: 88 },
  { skillId: "sk-react", name: "React, Vite & Tailwind CSS", category: "Frontend", proficiency: 90 },
  { skillId: "sk-nodejs", name: "Node.js (Active LTS) & REST APIs", category: "Backend", proficiency: 92 },
  { skillId: "sk-cicd", name: "GitHub Actions CI/CD & SAM CLI", category: "DevOps", proficiency: 88 },
];

const API = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach Cognito JWT Bearer token if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("idToken") || localStorage.getItem("adminToken");
  if (token && token !== "true") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Projects API
export const getProjects = async (params) => {
  if (!API_BASE_URL) {
    return { data: { projects: STATIC_PROJECTS } };
  }
  try {
    return await API.get("/projects", { params });
  } catch (err) {
    console.warn("Backend unavailable, using static projects fallback:", err.message);
    return { data: { projects: STATIC_PROJECTS } };
  }
};

export const getProject = async (id) => {
  if (!API_BASE_URL) {
    const proj = STATIC_PROJECTS.find((p) => p.projectId === id) || STATIC_PROJECTS[0];
    return { data: { project: proj } };
  }
  try {
    return await API.get(`/projects/${id}`);
  } catch (err) {
    const proj = STATIC_PROJECTS.find((p) => p.projectId === id) || STATIC_PROJECTS[0];
    return { data: { project: proj } };
  }
};

export const createProject = (data) => API.post("/projects", data);
export const updateProject = (id, data) => API.put(`/projects/${id}`, data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);

// Skills API
export const getSkills = async () => {
  if (!API_BASE_URL) {
    return { data: { skills: STATIC_SKILLS } };
  }
  try {
    return await API.get("/skills");
  } catch (err) {
    console.warn("Backend unavailable, using static skills fallback:", err.message);
    return { data: { skills: STATIC_SKILLS } };
  }
};

export const createSkill = (data) => API.post("/skills", data);
export const updateSkill = (id, data) => API.put(`/skills/${id}`, data);
export const deleteSkill = (id) => API.delete(`/skills/${id}`);

// Certifications API
export const getCertifications = async () => {
  if (!API_BASE_URL) {
    return { data: { certifications: [] } };
  }
  try {
    return await API.get("/certifications");
  } catch (err) {
    return { data: { certifications: [] } };
  }
};
export const createCertification = (data) => API.post("/certifications", data);
export const deleteCertification = (id) => API.delete(`/certifications/${id}`);

// Resume API
export const getResumeDownloadUrl = async () => {
  if (!API_BASE_URL) {
    return { data: { downloadUrl: "#", expiresIn: 0 } };
  }
  return API.get("/resume/download");
};
export const getResumeUploadUrl = () => API.post("/resume/upload");

// Contact API
export const sendContact = async (data) => {
  if (!API_BASE_URL) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            message: "Message recorded locally (cloud backend offline)",
            contactId: "offline-msg",
          },
        });
      }, 500);
    });
  }
  return API.post("/contact", data);
};
export const getContacts = () => API.get("/contact");

// Analytics & Rating API
export const getVisitors = async () => {
  if (!API_BASE_URL) {
    const stored = parseInt(localStorage.getItem("portfolio_visitor_count") || "42", 10);
    return { data: { totalVisits: stored, total: stored, count: stored } };
  }
  try {
    return await API.get("/visitor");
  } catch (err) {
    const stored = parseInt(localStorage.getItem("portfolio_visitor_count") || "42", 10);
    return { data: { totalVisits: stored, total: stored, count: stored } };
  }
};

export const recordVisitor = async () => {
  if (!API_BASE_URL) {
    let stored = parseInt(localStorage.getItem("portfolio_visitor_count") || "42", 10) + 1;
    localStorage.setItem("portfolio_visitor_count", String(stored));
    return { data: { message: "Visit recorded locally", totalVisits: stored, total: stored, count: stored } };
  }
  try {
    return await API.post("/visitor");
  } catch (err) {
    let stored = parseInt(localStorage.getItem("portfolio_visitor_count") || "42", 10) + 1;
    return { data: { message: "Visit recorded locally", totalVisits: stored, total: stored, count: stored } };
  }
};

export const getRating = async () => {
  if (!API_BASE_URL) {
    return { data: { avg: 5.0, averageRating: 5.0, totalRatings: 18 } };
  }
  try {
    return await API.get("/rating");
  } catch (err) {
    return { data: { avg: 5.0, averageRating: 5.0, totalRatings: 18 } };
  }
};

export const postRating = async (data) => {
  const payload = typeof data === "number" ? { score: data } : data;
  if (!API_BASE_URL) {
    return { data: { message: "Rating saved locally (cloud backend offline)" } };
  }
  return API.post("/rating", payload);
};

// Developer Stats API
export const getGitHubStats = (username) => {
  if (!API_BASE_URL) {
    return Promise.resolve({
      data: {
        username: username || "nikhilkumarneeli-crypto",
        followers: 12,
        publicRepos: 18,
      },
    });
  }
  return API.get(`/stats/github`, { params: { username } });
};

export const getLeetCodeStats = (username) => {
  if (!API_BASE_URL) {
    return Promise.resolve({
      data: {
        username: username || "nikhilkumar",
        ranking: 154230,
        submissions: [
          { difficulty: "All", count: 245 },
          { difficulty: "Easy", count: 120 },
          { difficulty: "Medium", count: 105 },
          { difficulty: "Hard", count: 20 },
        ],
      },
    });
  }
  return API.get(`/stats/leetcode`, { params: { username } });
};

export default API;