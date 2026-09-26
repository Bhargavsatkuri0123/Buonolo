const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

const REFRESH_STORAGE_KEY = "meet-peanut_refresh_token";

let accessToken: string | null = null;

function getStoredRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeRefreshToken(token: string | null) {
  try {
    if (token) localStorage.setItem(REFRESH_STORAGE_KEY, token);
    else localStorage.removeItem(REFRESH_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  status: number;
  details?: any;
  constructor(status: number, message: string, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired");
  }
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  profile: ProfileDto;
  isNewUser?: boolean;
}

export interface ProfileDto {
  id: string;
  name: string;
  handle: string;
  email: string;
  origin: string | null;
  host: string | null;
  city: string | null;
  bio: string | null;
  followers: number;
  following: number;
  notificationsEnabled: boolean;
}

export function setSession(session: { accessToken: string; refreshToken: string }) {
  accessToken = session.accessToken;
  storeRefreshToken(session.refreshToken);
}

export function clearSession() {
  accessToken = null;
  storeRefreshToken(null);
}

export function getAccessToken() {
  return accessToken;
}

async function rawRequest(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isForm && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  return res;
}

async function parseBody(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await rawRequest("/api/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken: getStoredRefreshToken() }),
      });
      if (!res.ok) return false;
      const data = await parseBody(res);
      if (!data?.accessToken) return false;
      setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

const AUTH_PATHS_NO_RETRY = ["/api/auth/login", "/api/auth/register", "/api/auth/refresh", "/api/auth/google"];

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  let res = await rawRequest(path, options);

  if (res.status === 401 && !AUTH_PATHS_NO_RETRY.includes(path)) {
    const refreshed = await refreshSession();
    if (!refreshed) {
      clearSession();
      throw new SessionExpiredError();
    }
    res = await rawRequest(path, options);
  }

  if (!res.ok) {
    const body = await parseBody(res);
    const message = (body && (body.error || body.message)) || res.statusText || "Request failed";
    throw new ApiError(res.status, message, body?.details);
  }

  if (res.status === 204) return undefined as T;
  return (await parseBody(res)) as T;
}

function qs(params: Record<string, any>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") search.set(k, String(v));
  });
  const str = search.toString();
  return str ? `?${str}` : "";
}

export const api = {
  setSession,
  clearSession,
  getAccessToken,

  auth: {
    register: (email: string, password: string, fullName: string) =>
      request<Session>("/api/auth/register", { method: "POST", body: JSON.stringify({ email, password, fullName }) }),
    google: (idToken: string) =>
      request<Session>("/api/auth/google", { method: "POST", body: JSON.stringify({ idToken }) }),
    login: (email: string, password: string) =>
      request<Session>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    refresh: refreshSession,
    logout: () => request<void>("/api/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken: getStoredRefreshToken() }) }),
    me: () => request<{ profile: ProfileDto }>("/api/auth/me"),
  },

  users: {
    updateMe: (patch: Partial<{ fullName: string; origin: string; host: string; city: string; bio: string; notificationsEnabled: boolean }>) =>
      request<{ profile: ProfileDto }>("/api/users/me", { method: "PATCH", body: JSON.stringify(patch) }),
    search: (q: string) => request<{ users: { id: string; fullName: string; handle: string; origin: string; bio: string }[] }>(`/api/users/search${qs({ q })}`),
    following: () => request<{ users: any[] }>("/api/users/me/following"),
    get: (id: string) => request<{ profile: ProfileDto; isFollowing: boolean }>(`/api/users/${id}`),
    follow: (id: string) => request<void>(`/api/users/${id}/follow`, { method: "POST" }),
    unfollow: (id: string) => request<void>(`/api/users/${id}/follow`, { method: "DELETE" }),
  },

  posts: {
    list: (params: { cursor?: string; limit?: number; authorId?: string; savedOnly?: boolean } = {}) =>
      request<{ posts: any[]; nextCursor: string | null }>(`/api/posts${qs(params)}`),
    create: (data: { content: string; attachment?: string; bgTheme?: string; feeling?: string; location?: string; privacy?: "PUBLIC" | "FRIENDS" | "PRIVATE"; taggedUserIds?: string[] }) =>
      request<{ post: any }>("/api/posts", { method: "POST", body: JSON.stringify(data) }),
    remove: (id: string) => request<void>(`/api/posts/${id}`, { method: "DELETE" }),
    react: (id: string, emoji: string = "👍") => request<{ reaction: any }>(`/api/posts/${id}/reaction`, { method: "PUT", body: JSON.stringify({ emoji }) }),
    unreact: (id: string) => request<void>(`/api/posts/${id}/reaction`, { method: "DELETE" }),
    save: (id: string) => request<void>(`/api/posts/${id}/save`, { method: "PUT" }),
    unsave: (id: string) => request<void>(`/api/posts/${id}/save`, { method: "DELETE" }),
    comments: (id: string) => request<{ comments: any[] }>(`/api/posts/${id}/comments`),
    addComment: (id: string, content: string) => request<{ comment: any }>(`/api/posts/${id}/comments`, { method: "POST", body: JSON.stringify({ content }) }),
  },

  groups: {
    list: () => request<{ groups: any[] }>("/api/groups"),
    create: (data: { name: string; description?: string; category?: string; emoji?: string }) =>
      request<{ group: any }>("/api/groups", { method: "POST", body: JSON.stringify(data) }),
    get: (id: string) => request<{ group: any }>(`/api/groups/${id}`),
    remove: (id: string) => request<void>(`/api/groups/${id}`, { method: "DELETE" }),
    join: (id: string) => request<void>(`/api/groups/${id}/join`, { method: "POST" }),
    leave: (id: string) => request<void>(`/api/groups/${id}/join`, { method: "DELETE" }),
    updates: (id: string) => request<{ updates: any[] }>(`/api/groups/${id}/updates`),
    postUpdate: (id: string, content: string) => request<{ update: any }>(`/api/groups/${id}/updates`, { method: "POST", body: JSON.stringify({ content }) }),
    invite: (id: string, inviteeId: string) => request<{ invite: any }>(`/api/groups/${id}/invites`, { method: "POST", body: JSON.stringify({ inviteeId }) }),
    receivedInvites: () => request<{ invites: any[] }>("/api/groups/invites/received"),
    respondInvite: (inviteId: string, status: "ACCEPTED" | "DECLINED") =>
      request<void>(`/api/groups/invites/${inviteId}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  },

  events: {
    list: () => request<{ events: any[] }>("/api/events"),
    create: (data: { title: string; description?: string; image?: string; date: string; location: string }) =>
      request<{ event: any }>("/api/events", { method: "POST", body: JSON.stringify(data) }),
    rsvp: (id: string) => request<void>(`/api/events/${id}/rsvp`, { method: "POST" }),
    cancelRsvp: (id: string) => request<void>(`/api/events/${id}/rsvp`, { method: "DELETE" }),
  },

  goals: {
    list: () => request<{ goals: any[] }>("/api/goals"),
    create: (data: { title: string; category: string; iconName?: string; steps?: any[] }) =>
      request<{ goal: any }>("/api/goals", { method: "POST", body: JSON.stringify(data) }),
    fromTemplate: (templateId: string) => request<{ goal: any }>(`/api/goals/from-template/${templateId}`, { method: "POST" }),
    remove: (id: string) => request<void>(`/api/goals/${id}`, { method: "DELETE" }),
    addStep: (id: string, step: { text: string; description?: string; tool?: string; links?: any[] }) =>
      request<{ step: any }>(`/api/goals/${id}/steps`, { method: "POST", body: JSON.stringify(step) }),
    updateStep: (id: string, stepId: string, patch: { text?: string; description?: string; tool?: string; done?: boolean; links?: any[] }) =>
      request<{ step: any }>(`/api/goals/${id}/steps/${stepId}`, { method: "PATCH", body: JSON.stringify(patch) }),
    removeStep: (id: string, stepId: string) => request<void>(`/api/goals/${id}/steps/${stepId}`, { method: "DELETE" }),
  },

  content: {
    goalTemplates: () => request<{ templates: any[] }>("/api/content/goal-templates"),
  },

  messages: {
    conversations: () => request<{ conversations: any[] }>("/api/messages/conversations"),
    thread: (userId: string) => request<{ messages: any[] }>(`/api/messages/${userId}`),
    send: (userId: string, content: string) => request<{ message: any }>(`/api/messages/${userId}`, { method: "POST", body: JSON.stringify({ content }) }),
  },

  notifications: {
    list: () => request<{ notifications: any[] }>("/api/notifications"),
    markRead: (id: string) => request<void>(`/api/notifications/${id}/read`, { method: "PATCH" }),
    readAll: () => request<void>("/api/notifications/read-all", { method: "POST" }),
  },

  uploads: {
    upload: async (file: File): Promise<{ url: string }> => {
      const form = new FormData();
      form.append("file", file);
      return request<{ url: string }>("/api/uploads", { method: "POST", body: form });
    },
  },
};

export function mapProfileFromApi(p: ProfileDto) {
  return {
    id: p.id,
    name: p.name || "User",
    handle: p.handle || `@${(p.name || "user").replace(/\s+/g, "").toLowerCase()}`,
    email: p.email,
    origin: p.origin || "",
    host: p.host || "",
    city: p.city || "",
    followers: p.followers || 0,
    following: p.following || 0,
    bio: p.bio || "",
    notificationsEnabled: p.notificationsEnabled,
  };
}

export function mapPostFromApi(dto: any) {
  return {
    id: dto.id,
    name: dto.author?.fullName || "Community Member",
    author_id: dto.author?.id,
    text: dto.content,
    content: dto.content,
    time: new Date(dto.createdAt).toLocaleDateString(),
    created_at: dto.createdAt,
    likes: dto.likesCount || 0,
    liked: !!dto.myReaction,
    myReaction: dto.myReaction || undefined,
    comments: dto.commentsCount || 0,
    privacy: dto.privacy,
    tags: (dto.tags || []).map((t: any) => t.fullName),
    bgTheme: dto.bgTheme,
    attachment: dto.attachment,
    feeling: dto.feeling,
    location: dto.location,
    saved: !!dto.saved,
    following: false,
  };
}

export function mapStepFromApi(s: any) {
  return { id: s.id, t: s.text, d: s.description || "", done: !!s.done, tool: s.tool || "Tasks", links: s.links };
}

export function mapStepToApi(s: { t: string; d?: string; tool?: string; links?: any[] }) {
  return { text: s.t, description: s.d, tool: s.tool, links: s.links };
}

export function mapGoalFromApi(g: any) {
  return {
    id: g.id,
    title: g.title,
    cat: g.category || "General",
    iconName: g.iconName || "Target",
    steps: (g.steps || []).map(mapStepFromApi),
  };
}
