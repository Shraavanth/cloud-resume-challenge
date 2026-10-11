import axios from "axios";

// Configurable base URL: prefers environment variable, falls back to deployed API Gateway
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://tn8yd69x7c.execute-api.eu-north-1.amazonaws.com";

const API = axios.create({
  baseURL: API_BASE_URL,
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
export const getProjects = (params) => API.get("/projects", { params });
export const getProject = (id) => API.get(`/projects/${id}`);
export const createProject = (data) => API.post("/projects", data);
export const updateProject = (id, data) => API.put(`/projects/${id}`, data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);

// Skills API
export const getSkills = () => API.get("/skills");
export const createSkill = (data) => API.post("/skills", data);
export const updateSkill = (id, data) => API.put(`/skills/${id}`, data);
export const deleteSkill = (id) => API.delete(`/skills/${id}`);

// Certifications API
export const getCertifications = () => API.get("/certifications");
export const createCertification = (data) => API.post("/certifications", data);
export const deleteCertification = (id) => API.delete(`/certifications/${id}`);

// Resume API
export const getResumeDownloadUrl = () => API.get("/resume/download");
export const getResumeUploadUrl = () => API.post("/resume/upload");

// Contact API
export const sendContact = (data) => API.post("/contact", data);
export const getContacts = () => API.get("/contact");

// Analytics & Rating API
export const getVisitors = () => API.get("/visitor");
export const recordVisitor = () => API.post("/visitor");
export const getRating = () => API.get("/rating");
export const postRating = (data) => API.post("/rating", typeof data === "number" ? { score: data } : data);

// Developer Stats API
export const getGitHubStats = (username) => API.get(`/stats/github`, { params: { username } });
export const getLeetCodeStats = (username) => API.get(`/stats/leetcode`, { params: { username } });

export default API;