import fs from "fs";
import http from "http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./env.js";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { postsRouter } from "./routes/posts.js";
import { groupsRouter } from "./routes/groups.js";
import { eventsRouter } from "./routes/events.js";
import { goalsRouter } from "./routes/goals.js";
import { messagesRouter } from "./routes/messages.js";
import { notificationsRouter } from "./routes/notifications.js";
import { contentRouter } from "./routes/content.js";
import { botRouter } from "./routes/bot.js";
import { uploadsRouter } from "./routes/uploads.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { initWebSocketGateway } from "./ws/gateway.js";

fs.mkdirSync(env.uploadDir, { recursive: true });

const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(env.uploadDir));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/goals", goalsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/content", contentRouter);
app.use("/api/bot", botRouter);
app.use("/api/uploads", uploadsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const server = http.createServer(app);
initWebSocketGateway(server);

server.listen(env.port, "0.0.0.0", () => {
  console.log(`Buonolo backend listening on port ${env.port}`);
});
