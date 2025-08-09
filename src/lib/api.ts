// src/lib/api.ts

// Pastikan ada fallback -> tidak jadi "undefined"
const RAW_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Normalisasi (hapus trailing slash)
function trimSlash(s: string) {
  return s.replace(/\/+$/, "");
}
function joinUrl(base: string, path: string) {
  const b = trimSlash(base);
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

const API_BASE_URL = trimSlash(RAW_BASE);

// // (opsional) log sekali biar mudah debug
// if (!API_BASE_URL) {
//   console.warn(
//     "[api] VITE_API_BASE_URL tidak ter-set. Pakai default http://localhost:8000"
//   );
// } else {
//   console.log("[api] base =", API_BASE_URL);
// }

interface RequestOptions extends RequestInit {
  token?: string;
}

let isRedirecting = false;
let onUnauthorized: () => void = () => {
  if (isRedirecting) return;
  isRedirecting = true;
  try {
    localStorage.removeItem("token");
  } catch {}
  window.location.href = "/auth";
};

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

async function parseJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    if (res.status === 204 || res.status === 205) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function apiRequest<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  let res: Response;
  try {
    res = await fetch(joinUrl(API_BASE_URL, url), {
      ...options,
      headers,
    });
  } catch (e: any) {
    throw new Error(e?.message || "Network error");
  }

  const data = await parseJsonSafe<any>(res);

  if (!res.ok) {
    const msg =
      data?.error || data?.message || res.statusText || "Something went wrong";

    if (res.status === 401 || msg === "The jwt is expired.") {
      onUnauthorized();
    }
    throw new Error(msg);
  }

  if (data === null) {
    // @ts-ignore
    return undefined as T;
  }

  return data as T;
}

export const api = {
  get: <T>(url: string, token?: string) =>
    apiRequest<T>(url, { method: "GET", token }),
  post: <T>(url: string, data?: any, token?: string) =>
    apiRequest<T>(url, {
      method: "POST",
      body: data !== undefined ? JSON.stringify(data) : undefined,
      token,
    }),
  put: <T>(url: string, data?: any, token?: string) =>
    apiRequest<T>(url, {
      method: "PUT",
      body: data !== undefined ? JSON.stringify(data) : undefined,
      token,
    }),
  delete: <T>(url: string, token?: string) =>
    apiRequest<T>(url, { method: "DELETE", token }),
};
