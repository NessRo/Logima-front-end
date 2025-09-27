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

// ---- Uploads (S3 Presigned POST) ----

// Minimal MIME fallbacks when file.type is empty/odd (e.g. .pages, .doc)
const MIME_FALLBACKS = {
  doc:  "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pages: "application/vnd.apple.pages",
  txt:  "text/plain",
  md:   "text/markdown",
  csv:  "text/csv",
  mp3:  "audio/mpeg",
  m4a:  "audio/mp4",
  aac:  "audio/aac",
  wav:  "audio/wav",
  flac: "audio/flac",
  ogg:  "audio/ogg",
  webm: "audio/webm",
  mid:  "audio/midi",
  midi: "audio/midi",
  aif:  "audio/aiff",
  aiff: "audio/aiff",
};
function mimeFromFilename(name, fallback = "application/octet-stream") {
  const ext = (name.split(".").pop() || "").toLowerCase();
  return MIME_FALLBACKS[ext] || fallback;
}

// Internal: POST the FormData to S3.
// Uses XHR if onProgress is provided; otherwise uses fetch.
async function postFormToS3({ url, formData, onProgress }) {
  if (typeof onProgress === "function") {
    // XHR path for progress
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const pct = Math.round((evt.loaded / evt.total) * 100);
          onProgress({ loaded: evt.loaded, total: evt.total, pct });
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`S3 upload failed (${xhr.status})`));
      };
      xhr.onerror = () => reject(new Error("Network error uploading to S3"));
      xhr.send(formData);
    });
  } else {
    // fetch path (no progress)
    const res = await fetch(url, { method: "POST", body: formData });
    if (!res.ok) throw new Error(`S3 upload failed (${res.status})`);
  }
}

export const uploadsApi = {
  /**
   * Ask backend for a presigned POST.
   * Returns { url, fields, key, public_url }
   */
  async presignPost({ filename, contentType, projectId, userId, maxBytes } = {}) {
    if (!filename) throw new Error("filename is required");
    const params = {
      filename,
      content_type: contentType,
      project_id: projectId,
      user_id: userId,
    };
    if (maxBytes) params.max_bytes = maxBytes;

    const r = await api.post("/uploads/presign-post", null, { params });
    return r.data.upload;
  },

  /**
   * End-to-end upload helper.
   * - infers a reasonable contentType if file.type is empty
   * - calls presign endpoint
   * - posts file to S3 (with optional progress)
   * Returns { key, publicUrl }
   */
  async uploadFile({ file, projectId, userId, onProgress, maxBytes } = {}) {
    if (!file) throw new Error("file is required");
    const contentType = file.type || mimeFromFilename(file.name);

    // 1) get presigned POST
    const { url, fields, key, public_url } = await this.presignPost({
      filename: file.name,
      contentType,
      projectId,
      userId,
      maxBytes,
    });

    // 2) build form data (IMPORTANT: do NOT set Content-Type header manually)
    const form = new FormData();
    Object.entries(fields).forEach(([k, v]) => form.append(k, v));
    form.append("file", file);

    // 3) send to S3
    await postFormToS3({ url, formData: form, onProgress });

    // 4) done
    return { key, publicUrl: public_url };
  },

  /**
   * Lower-level primitive if you already have { url, fields } and just need to send the file.
   */
  async postToS3({ url, fields, file, onProgress }) {
    const form = new FormData();
    Object.entries(fields).forEach(([k, v]) => form.append(k, v));
    form.append("file", file);
    await postFormToS3({ url, formData: form, onProgress });
  },
};