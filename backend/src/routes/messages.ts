import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { notifyUser } from "../lib/notify.js";
import { publishEvent } from "../ws/gateway.js";

export const messagesRouter = Router();

messagesRouter.get(
  "/conversations",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const userId = req.userId!;
    const [recent, unreadGroups] = await Promise.all([
      prisma.message.findMany({
        where: { OR: [{ senderId: userId }, { receiverId: userId }] },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
      prisma.message.groupBy({
        by: ["senderId"],
        where: { receiverId: userId, isRead: false },
        _count: { _all: true },
      }),
    ]);

    const unreadBySender = new Map(unreadGroups.map((g) => [g.senderId, g._count._all]));
    const latestByCounterpart = new Map<string, (typeof recent)[number]>();
    for (const message of recent) {
      const counterpartId = message.senderId === userId ? message.receiverId : message.senderId;
      if (!latestByCounterpart.has(counterpartId)) latestByCounterpart.set(counterpartId, message);
    }

    const counterpartIds = [...latestByCounterpart.keys()];
    const counterparts = await prisma.user.findMany({
      where: { id: { in: counterpartIds } },
      select: { id: true, fullName: true, handle: true },
    });
    const counterpartById = new Map(counterparts.map((c) => [c.id, c]));

    const conversations = counterpartIds
      .map((id) => ({
        counterpart: counterpartById.get(id),
        lastMessage: latestByCounterpart.get(id),
        unreadCount: unreadBySender.get(id) ?? 0,
      }))
      .filter((c) => c.counterpart)
      .sort((a, b) => (b.lastMessage!.createdAt > a.lastMessage!.createdAt ? 1 : -1));

    res.json({ conversations });
  })
);

messagesRouter.get(
  "/:userId",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const me = req.userId!;
    const other = req.params.userId;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: me, receiverId: other },
          { senderId: other, receiverId: me },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    await prisma.message.updateMany({
      where: { senderId: other, receiverId: me, isRead: false },
      data: { isRead: true },
    });

    res.json({ messages });
  })
);

const sendMessageSchema = z.object({ content: z.string().min(1).max(4000) });

messagesRouter.post(
  "/:userId",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const { content } = sendMessageSchema.parse(req.body);
    const message = await prisma.message.create({
      data: { senderId: req.userId!, receiverId: req.params.userId, content },
    });

    const sender = await prisma.user.findUnique({ where: { id: req.userId! }, select: { fullName: true } });
    await notifyUser(req.params.userId, "message", "New message", `${sender?.fullName ?? "Someone"} sent you a message.`);
    await publishEvent({ type: "message:new", targetUserIds: [req.params.userId, req.userId!], payload: message });

    res.status(201).json({ message });
  })
);
