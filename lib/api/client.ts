import type { ProblemDetails } from "./types";

const DEFAULT_TIMEOUT_MS = 5_000;

export class ApiError extends Error {
  readonly status: number;
  readonly problem?: ProblemDetails;

  constructor(status: number, message: string, problem?: ProblemDetails) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
  }
}

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) {
    throw new ApiError(
      0,
      "NEXT_PUBLIC_API_BASE_URL ist nicht gesetzt. Bitte .env.local prüfen.",
    );
  }
  return base.replace(/\/+$/, "");
}

function buildUrl(path: string): string {
  const base = getBaseUrl();
  if (/^https?:\/\//i.test(path)) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function isProblemDetailsContentType(contentType: string | null): boolean {
  if (!contentType) return false;
  return /application\/problem\+json/i.test(contentType);
}

async function parseErrorBody(
  response: Response,
): Promise<{ message: string; problem?: ProblemDetails }> {
  const contentType = response.headers.get("content-type");
  try {
    if (contentType && /json/i.test(contentType)) {
      const body = (await response.json()) as ProblemDetails | { detail?: unknown; message?: unknown };
      if (isProblemDetailsContentType(contentType)) {
        const problem = body as ProblemDetails;
        const message =
          (typeof problem.detail === "string" && problem.detail) ||
          (typeof problem.title === "string" && problem.title) ||
          response.statusText ||
          `HTTP ${response.status}`;
        return { message, problem };
      }
      const detail = (body as { detail?: unknown }).detail;
      const message = (body as { message?: unknown }).message;
      if (typeof detail === "string") return { message: detail };
      if (typeof message === "string") return { message };
    } else {
      const text = await response.text();
      if (text) return { message: text };
    }
  } catch {
    // fall through to status fallback
  }
  return { message: response.statusText || `HTTP ${response.status}` };
}

/**
 * Typed fetch wrapper for the ARIA backend.
 * Throws {@link ApiError} on non-2xx responses and on network/timeout errors.
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path), {
      ...init,
      headers,
      signal: init.signal ?? controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(0, "Anfrage hat das Zeitlimit von 5 s überschritten.");
    }
    const message = err instanceof Error ? err.message : "Netzwerkfehler.";
    throw new ApiError(0, message);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const { message, problem } = await parseErrorBody(response);
    throw new ApiError(response.status, message, problem);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
