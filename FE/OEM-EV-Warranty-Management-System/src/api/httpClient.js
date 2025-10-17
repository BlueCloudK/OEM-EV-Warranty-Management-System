// Lightweight HTTP client around fetch with base URL, JSON handling, and JWT

const getBaseUrl = () => {
  const envUrl = (import.meta?.env?.VITE_API_BASE_URL || "").trim();
  const url = envUrl || "https://backend.bluecloudk.xyz"; // fallback when env not loaded
  return url.replace(/\/$/, "");
};

const buildHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...extraHeaders,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const parseJsonSafe = async (res) => {
  const contentType = res.headers.get("Content-Type") || "";
  if (!contentType.includes("application/json")) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const readTextSafe = async (res) => {
  try {
    return await res.text();
  } catch {
    return "";
  }
};

export async function httpRequest(
  path,
  { method = "GET", body, headers } = {}
) {
  const base = getBaseUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    method,
    headers: buildHeaders(headers),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 || res.status === 403) {
    // Clear stale auth and redirect to login
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      // keep user info cleanup optional
    } catch {}
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login")
    ) {
      window.location.href = "/login";
    }
  }

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    let message = (data && (data.message || data.error)) || "";
    let textBody = "";
    if (!message) {
      textBody = await readTextSafe(res);
      message = textBody || `${res.status} ${res.statusText}`;
    }
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    error.raw = textBody;
    throw error;
  }

  return { data, res };
}

export const http = {
  get: (path, options = {}) => httpRequest(path, { ...options, method: "GET" }),
  post: (path, body, options = {}) =>
    httpRequest(path, { ...options, method: "POST", body }),
  put: (path, body, options = {}) =>
    httpRequest(path, { ...options, method: "PUT", body }),
  patch: (path, body, options = {}) =>
    httpRequest(path, { ...options, method: "PATCH", body }),
  delete: (path, options = {}) =>
    httpRequest(path, { ...options, method: "DELETE" }),
};
