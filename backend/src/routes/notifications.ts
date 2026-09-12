import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const notificationsRouter = Router();

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

notificationsRouter.post(
  "/read-all",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    await prisma.notification.updateMany({ where: { userId: req.userId!, isRead: false }, data: { isRead: true } });
    res.status(204).end();
  })
);
