"use client";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const DEFAULT_ERROR_MESSAGE = "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "message" in data && typeof data.message === "string"
        ? data.message
        : undefined) ?? DEFAULT_ERROR_MESSAGE;
    throw new ApiError(res.status, message, data);
  }

  return data as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(`/api/backend/${path}`, { method: "GET" });
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(`/api/backend/${path}`, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(`/api/backend/${path}`, {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>(`/api/backend/${path}`, { method: "DELETE" });
}

export function authRegister<T>(body: unknown): Promise<T> {
  return request<T>("/api/auth/register", { method: "POST", body: JSON.stringify(body) });
}

export function authLogin<T>(body: unknown): Promise<T> {
  return request<T>("/api/auth/login", { method: "POST", body: JSON.stringify(body) });
}

export function authLogout(): Promise<{ ok: boolean }> {
  return request("/api/auth/logout", { method: "POST" });
}
