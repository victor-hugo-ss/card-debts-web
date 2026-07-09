import { clearToken, getToken } from "../lib/storage";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

export type ApiErrorPayload = {
  message: string;
  issues?: Record<string, string[]>;
};

export class ApiError extends Error {
  status: number;
  issues?: Record<string, string[]>;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = status;
    this.issues = payload.issues;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  params?: Record<string, string | number | undefined>;
};

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const url = new URL(path, API_URL);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

export async function api<T>(path: string, options: RequestOptions = {}) {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path, options.params), {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const payload = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
    }

    throw new ApiError(response.status, {
      message: payload?.message ?? "Não foi possível completar a requisição",
      issues: payload?.issues,
    });
  }

  return payload as T;
}
