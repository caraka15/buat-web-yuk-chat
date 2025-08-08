const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface RequestOptions extends RequestInit {
  token?: string;
}

async function apiRequest<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(
      errorData.error || errorData.message || "Something went wrong"
    );
  }

  return response.json();
}

export const api = {
  get: <T>(url: string, token?: string) =>
    apiRequest<T>(url, { method: "GET", token }),
  post: <T>(url: string, data: any, token?: string) =>
    apiRequest<T>(url, { method: "POST", body: JSON.stringify(data), token }),
  put: <T>(url: string, data: any, token?: string) =>
    apiRequest<T>(url, { method: "PUT", body: JSON.stringify(data), token }),
  delete: <T>(url: string, token?: string) =>
    apiRequest<T>(url, { method: "DELETE", token }),
};
