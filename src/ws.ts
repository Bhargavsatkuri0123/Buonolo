export type WsEventType =
  | "post:new"
  | "post:deleted"
  | "comment:new"
  | "reaction:new"
  | "message:new"
  | "notification:new"
  | "invite:new"
  | "group:update";

type Handler = (payload: any) => void;

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

function wsUrl(token: string): string {
  const base = API_BASE || window.location.origin;
  const wsBase = base.replace(/^http/, "ws");
  return `${wsBase}/ws?token=${encodeURIComponent(token)}`;
}

class WsClient {
  private socket: WebSocket | null = null;
  private listeners = new Map<WsEventType, Set<Handler>>();
  private getFreshToken: (() => Promise<string | null>) | null = null;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private closedByClient = false;

  connect(getFreshToken: () => Promise<string | null>) {
    this.getFreshToken = getFreshToken;
    this.closedByClient = false;
    this.open();
  }

  private async open() {
    if (!this.getFreshToken) return;
    const token = await this.getFreshToken();
    if (!token) return;

    if (this.socket) {
      try { this.socket.close(); } catch { /* ignore */ }
    }

    const socket = new WebSocket(wsUrl(token));
    this.socket = socket;

    socket.onopen = () => {
      this.reconnectAttempt = 0;
    };

    socket.onmessage = (event) => {
      try {
        const { type, payload } = JSON.parse(event.data);
        const handlers = this.listeners.get(type);
        handlers?.forEach((h) => h(payload));
      } catch {
        /* ignore malformed messages */
      }
    };

    socket.onclose = () => {
      if (this.closedByClient) return;
      this.scheduleReconnect();
    };

    socket.onerror = () => {
      try { socket.close(); } catch { /* ignore */ }
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    const delay = Math.min(30000, 1000 * 2 ** this.reconnectAttempt);
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.open();
    }, delay);
  }

  disconnect() {
    this.closedByClient = true;
    this.getFreshToken = null;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      try { this.socket.close(); } catch { /* ignore */ }
      this.socket = null;
    }
  }

  subscribe(type: WsEventType, handler: Handler): () => void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler);
    return () => {
      this.listeners.get(type)?.delete(handler);
    };
  }
}

export const wsClient = new WsClient();
