import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { publishEvent } from "../ws/gateway.js";

export const notificationsRouter = Router();

notificationsRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = z.object({
      title: z.string().min(1).max(160),
      body: z.string().min(1).max(1000),
      type: z.string().min(1).max(60).default("system"),
    }).parse(req.body);
    const notification = await prisma.notification.create({ data: { ...data, userId: req.userId! } });
    await publishEvent({ type: "notification:new", targetUserIds: [req.userId!], payload: notification });
    res.status(201).json({ notification });
  })
);

notificationsRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json({ notifications });
  })
);

notificationsRouter.patch(
  "/:id/read",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.userId! },
      data: { isRead: true },
    });
    res.status(204).end();
  })
);

notificationsRouter.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    await prisma.notification.deleteMany({ where: { id: req.params.id, userId: req.userId! } });
    res.status(204).end();
  })
);

notificationsRouter.post(
  "/read-all",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    await prisma.notification.updateMany({ where: { userId: req.userId!, isRead: false }, data: { isRead: true } });
    res.status(204).end();
  })
);
