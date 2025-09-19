// src/lib/api.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,         // e.g. http://localhost:8000
  timeout: 15000,                // 15s
  withCredentials: true,        // set true if you use cookies/session auth
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});


function getCookie(name) {
    const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[2]) : null;
}


// ---- Request interceptor (attach auth, trace IDs, etc.) ----
api.interceptors.request.use(
  (config) => {
     const csrf = getCookie("csrf_token");
    if (csrf) config.headers["X-CSRF-Token"] = csrf;
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


// Auth
export const authApi = {
    register({ email, password }) { return api.post("/auth/register", { email, password }).then(r => r.data); },
    login({ email, password })     { return api.post("/auth/login",    { email, password }).then(r => r.data); },
    logout()                       { return api.post("/auth/logout").then(r => r.data); },
    me()                          { return api.get("/auth/me").then(r => r.data); },
};





// ---- Domain-specific helpers (optional, recommended) ----
export const projectsApi = {
  create(payload) {
    // backend: prefix="/projects", route="/api/create" -> /projects/api/create
    return api.post("/projects/api/create", payload).then((r) => r.data);
  },
  list(status) {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    return api.get(`/projects/api/list${qs}`).then(r => r.data);
  },
  update(id, payload) {
    return api.patch(`/projects/api/${id}`, payload).then(r => r.data);
  },
  softDelete(id) {
    return api.patch(`/projects/api/${id}`, { status: "inactive" }).then(r => r.data);
  },
  get(id, config={}) {
    return api.get(`/projects/api/${id}`, config).then( r => r.data);
  },
  aiRefreshOutcome(id, { description } = {}, config = {}) {
    // If no override provided, send no body so backend uses current project.description
    const body = description === undefined ? undefined : { description };
    return api.post(`/projects/api/${id}/ai-refresh`, body, config).then(r => r.data);
  },
  
  // add more: get(id), update(id, data), remove(id)...
};