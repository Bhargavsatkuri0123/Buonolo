import type { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { verifyAccessToken } from "../lib/tokens.js";
import { redisPub, redisSub } from "../redis.js";

export type WsEventType =
  | "post:new"
  | "post:deleted"
  | "comment:new"
  | "reaction:new"
  | "message:new"
  | "notification:new"
  | "invite:new"
  | "group:update";

export interface WsEvent {
  type: WsEventType;
  targetUserIds?: string[]; // omit to broadcast to every connected client
  payload: unknown;
}

const REDIS_CHANNEL = "buonolo:ws-events";

const connections = new Map<string, Set<WebSocket>>();

function addConnection(userId: string, ws: WebSocket) {
  if (!connections.has(userId)) connections.set(userId, new Set());
  connections.get(userId)!.add(ws);
}

function removeConnection(userId: string, ws: WebSocket) {
  const set = connections.get(userId);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) connections.delete(userId);
}

function deliverLocally(event: WsEvent) {
  const targets = event.targetUserIds;
  const message = JSON.stringify({ type: event.type, payload: event.payload });

  if (!targets) {
    for (const sockets of connections.values()) {
      for (const ws of sockets) if (ws.readyState === WebSocket.OPEN) ws.send(message);
    }
    return;
  }
  for (const userId of targets) {
    const sockets = connections.get(userId);
    if (!sockets) continue;
    for (const ws of sockets) if (ws.readyState === WebSocket.OPEN) ws.send(message);
  }
}

export async function publishEvent(event: WsEvent): Promise<void> {
  await redisPub.publish(REDIS_CHANNEL, JSON.stringify(event));
}

export function initWebSocketGateway(server: HttpServer): void {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url ?? "", "http://internal");
    const token = url.searchParams.get("token");
    if (!token) {
      ws.close(4401, "Missing token");
      return;
    }

    let userId: string;
    try {
      userId = verifyAccessToken(token).sub;
    } catch {
      ws.close(4401, "Invalid token");
      return;
    }

    addConnection(userId, ws);

    let alive = true;
    ws.on("pong", () => {
      alive = true;
    });
    const heartbeat = setInterval(() => {
      if (!alive) {
        ws.terminate();
        return;
      }
      alive = false;
      ws.ping();
    }, 30000);

    ws.on("close", () => {
      clearInterval(heartbeat);
      removeConnection(userId, ws);
    });
  });

  redisSub.subscribe(REDIS_CHANNEL, (err?: Error | null) => {
    if (err) console.error("Failed to subscribe to WS event channel", err);
  });

  redisSub.on("message", (channel: string, message: string) => {
    if (channel !== REDIS_CHANNEL) return;
    try {
      deliverLocally(JSON.parse(message) as WsEvent);
    } catch (err) {
      console.error("Failed to process WS event", err);
    }
  });
}
