import axios from "axios";

const API = axios.create({
  baseURL:"https://tn8yd69x7c.execute-api.eu-north-1.amazonaws.com"
});

export const getSkills = () => API.get("/skills");
export const getProjects = () => API.get("/projects");
export const sendContact = (data) => API.post("/contact", data);
export const getRating = () => API.get("/rating");
export const postRating = (data) => API.post("/rating", data);
export const getVisitors = () => API.post("/visitor");