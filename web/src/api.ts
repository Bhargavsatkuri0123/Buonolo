// Typed client for the Buonolo backend REST + WebSocket API. Replaces the old direct-to-Supabase calls.

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        });
        if (!res.ok) return false;
        const data = await res.json();
        setAccessToken(data.accessToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  isForm?: boolean;
  skipAuthRetry?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (!options.isForm) headers["Content-Type"] = "application/json";

  const res = await fetch(path, {
    method: options.method ?? "GET",
    headers,
    credentials: "include",
    body: options.body === undefined ? undefined : options.isForm ? (options.body as FormData) : JSON.stringify(options.body),
  });

  if (res.status === 401 && !options.skipAuthRetry) {
    const refreshed = await refreshSession();
    if (refreshed) return request<T>(path, { ...options, skipAuthRetry: true });
  }

  if (!res.ok) {
    let details: unknown;
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data.error ?? message;
      details = data.details;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new ApiError(res.status, message, details);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: body ?? {} }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body: body ?? {} }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body: body ?? {} }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, form: FormData) => request<T>(path, { method: "POST", body: form, isForm: true }),
  /** Initializes the session on app load using the httpOnly refresh cookie, if one is present. */
  restoreSession: () => refreshSession(),
};

export type WsEvent =
  | { type: "post:new" | "post:deleted"; payload: any }
  | { type: "comment:new"; payload: any }
  | { type: "reaction:new"; payload: any }
  | { type: "message:new"; payload: any }
  | { type: "notification:new"; payload: any }
  | { type: "invite:new"; payload: any }
  | { type: "group:update"; payload: any };

export function connectWebSocket(onEvent: (event: WsEvent) => void): () => void {
  let socket: WebSocket | null = null;
  let closedByCaller = false;
  let retryDelay = 1000;

  function connect() {
    if (!accessToken) return;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    socket = new WebSocket(`${protocol}//${window.location.host}/ws?token=${accessToken}`);

    socket.onmessage = (event) => {
      try {
        onEvent(JSON.parse(event.data));
      } catch {
        // ignore malformed events
      }
    };
    socket.onopen = () => {
      retryDelay = 1000;
    };
    socket.onclose = () => {
      if (closedByCaller) return;
      setTimeout(connect, retryDelay);
      retryDelay = Math.min(retryDelay * 2, 30000);
    };
  }

  connect();

  return () => {
    closedByCaller = true;
    socket?.close();
  };
}
