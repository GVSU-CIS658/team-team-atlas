const API_BASE = "/api/v1";

interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: { field: string; reason: string }[];
  };
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: { field: string; reason: string }[];

  constructor(status: number, body: ApiErrorBody["error"]) {
    super(body.message);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code;
    this.details = body.details;
  }
}

async function tryRefresh(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    const json = await res.json();
    const newToken: string = json.data.accessToken;
    localStorage.setItem("accessToken", newToken);
    return newToken;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
  retry = true, // prevents infinite refresh loop
): Promise<T> {
  let token = localStorage.getItem("accessToken");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && retry) {
    const newToken = await tryRefresh();
    if (newToken) {
      return apiFetch<T>(endpoint, options, false);
    }
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
    throw new ApiError(401, {
      code: "UNAUTHORIZED",
      message: "Session expired",
    });
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({
      error: { code: "UNKNOWN", message: "Request failed" },
    }));
    throw new ApiError(res.status, body.error);
  }

  const json = await res.json();
  return json.data as T;
}

export const api = {
  get: <T>(endpoint: string) => apiFetch<T>(endpoint),

  post: <T>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: "DELETE" }),
};
