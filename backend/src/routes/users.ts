import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { requireAuth, optionalAuth, type AuthedRequest } from "../middleware/auth.js";
import { loadProfile } from "../lib/serialize.js";
import { notifyUser } from "../lib/notify.js";

export const usersRouter = Router();

const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(120).optional(),
  origin: z.string().max(120).optional(),
  host: z.string().max(120).optional(),
  city: z.string().max(120).optional(),
  bio: z.string().max(1000).optional(),
  notificationsEnabled: z.boolean().optional(),
});

usersRouter.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = updateProfileSchema.parse(req.body);
    await prisma.user.update({ where: { id: req.userId! }, data });
    res.json({ profile: await loadProfile(req.userId!) });
  })
);

// Full account data export (GDPR-style "download your data").
usersRouter.get(
  "/me/export",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const userId = req.userId!;
    const [user, posts, comments, goals, messagesSent, messagesReceived, groupMemberships] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.post.findMany({ where: { authorId: userId }, include: { reactions: true, comments: true } }),
      prisma.comment.findMany({ where: { authorId: userId } }),
      prisma.goal.findMany({ where: { userId }, include: { steps: true } }),
      prisma.message.findMany({ where: { senderId: userId } }),
      prisma.message.findMany({ where: { receiverId: userId } }),
      prisma.groupMember.findMany({ where: { userId }, include: { group: true } }),
    ]);

    if (!user) throw new HttpError(404, "User not found");
    const { passwordHash, ...safeUser } = user;

    res.setHeader("Content-Disposition", "attachment; filename=buonolo-data-export.json");
    res.json({
      exportedAt: new Date().toISOString(),
      user: safeUser,
      posts,
      comments,
      goals,
      messagesSent,
      messagesReceived,
      groupMemberships,
    });
  })
);

usersRouter.delete(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    // Cascades to posts/comments/reactions/goals/messages/etc. via FK ON DELETE CASCADE in the schema.
    await prisma.user.delete({ where: { id: req.userId! } });
    res.status(204).end();
  })
);

usersRouter.get(
  "/search",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const q = String(req.query.q ?? "").trim();

    // With no query, surface recently-joined people to discover instead of an empty list.
    const users = await prisma.user.findMany({
      where: {
        id: { not: req.userId! },
        ...(q ? { OR: [{ fullName: { contains: q, mode: "insensitive" } }, { handle: { contains: q, mode: "insensitive" } }] } : {}),
      },
      take: 20,
      orderBy: q ? undefined : { createdAt: "desc" },
      select: { id: true, fullName: true, handle: true, origin: true, bio: true },
    });
    res.json({ users });
  })
);

usersRouter.get(
  "/me/following",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const following = await prisma.follow.findMany({
      where: { followerId: req.userId! },
      include: { following: { select: { id: true, fullName: true, handle: true, origin: true, bio: true } } },
    });
    res.json({ users: following.map((f) => f.following) });
  })
);

usersRouter.get(
  "/me/blocked",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const blocked = await prisma.blockedUser.findMany({
      where: { blockerId: req.userId! },
      include: { blocked: { select: { id: true, fullName: true, handle: true } } },
    });
    res.json({ users: blocked.map((b) => b.blocked) });
  })
);

usersRouter.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const profile = await loadProfile(req.params.id);
    if (!profile) throw new HttpError(404, "User not found");

    let isFollowing = false;
    if (req.userId) {
      const follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: req.userId, followingId: req.params.id } },
      });
      isFollowing = Boolean(follow);
    }
    res.json({ profile, isFollowing });
  })
);

usersRouter.post(
  "/:id/follow",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    if (req.params.id === req.userId) throw new HttpError(400, "You cannot follow yourself");
    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId: req.userId!, followingId: req.params.id } },
      create: { followerId: req.userId!, followingId: req.params.id },
      update: {},
    });
    const me = await prisma.user.findUnique({ where: { id: req.userId! }, select: { fullName: true } });
    await notifyUser(req.params.id, "follow", "New follower", `${me?.fullName ?? "Someone"} started following you.`);
    res.status(204).end();
  })
);

usersRouter.delete(
  "/:id/follow",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    await prisma.follow
      .delete({ where: { followerId_followingId: { followerId: req.userId!, followingId: req.params.id } } })
      .catch(() => undefined);
    res.status(204).end();
  })
);

usersRouter.post(
  "/:id/block",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    if (req.params.id === req.userId) throw new HttpError(400, "You cannot block yourself");
    await prisma.blockedUser.upsert({
      where: { blockerId_blockedId: { blockerId: req.userId!, blockedId: req.params.id } },
      create: { blockerId: req.userId!, blockedId: req.params.id },
      update: {},
    });
    res.status(204).end();
  })
);

usersRouter.delete(
  "/:id/block",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    await prisma.blockedUser
      .delete({ where: { blockerId_blockedId: { blockerId: req.userId!, blockedId: req.params.id } } })
      .catch(() => undefined);
    res.status(204).end();
  })
);
