// src/lib/api.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,         // e.g. http://localhost:8000
  timeout: 15000,                // 15s
  withCredentials: false,        // set true if you use cookies/session auth
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ---- Request interceptor (attach auth, trace IDs, etc.) ----
api.interceptors.request.use(
  (config) => {
    // Example: attach a bearer token if you add auth later
    // const token = localStorage.getItem("token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response interceptor (normalize errors/logging) ----
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize FastAPI errors (often { detail: "..." })
    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.message ||
      "Unknown error";
    return Promise.reject(new Error(message));
  }
);

// ---- Domain-specific helpers (optional, recommended) ----
export const projectsApi = {
  create(payload) {
    // backend: prefix="/projects", route="/api/create" -> /projects/api/create
    return api.post("/projects/api/create", payload).then((r) => r.data);
  },
  list() {
    return api.get("/projects/api/list").then((r) => r.data); // adjust if you have this route
  },
  update(id, payload) {
    return api.patch(`/projects/api/${id}`, payload).then(r => r.data);
  },
  softDelete(id) {
    return api.patch(`/projects/api/${id}`, { status: "inactive" }).then(r => r.data);
  },
  // add more: get(id), update(id, data), remove(id)...
};