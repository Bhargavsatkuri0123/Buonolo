import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { requireAuth, optionalAuth, type AuthedRequest } from "../middleware/auth.js";
import { notifyUser } from "../lib/notify.js";
import { publishEvent } from "../ws/gateway.js";

export const groupsRouter = Router();

groupsRouter.get(
  "/",
  optionalAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const groups = await prisma.group.findMany({
      include: { _count: { select: { members: true } }, members: req.userId ? { where: { userId: req.userId } } : false },
      orderBy: { createdAt: "desc" },
    });
    res.json({
      groups: groups.map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        category: g.category,
        emoji: g.emoji,
        adminId: g.adminId,
        membersCount: g._count.members,
        joined: (g.members?.length ?? 0) > 0,
      })),
    });
  })
);

const createGroupSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  category: z.string().max(60).optional(),
  emoji: z.string().max(8).optional(),
});

groupsRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = createGroupSchema.parse(req.body);
    const group = await prisma.group.create({
      data: {
        ...data,
        adminId: req.userId!,
        members: { create: { userId: req.userId!, role: "admin" } },
      },
    });
    res.status(201).json({ group });
  })
);

groupsRouter.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const group = await prisma.group.findUnique({
      where: { id: req.params.id },
      include: {
        members: { include: { user: { select: { id: true, fullName: true, handle: true } } } },
        _count: { select: { members: true } },
      },
    });
    if (!group) throw new HttpError(404, "Group not found");
    res.json({
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        category: group.category,
        emoji: group.emoji,
        adminId: group.adminId,
        membersCount: group._count.members,
        members: group.members.map((m) => ({ ...m.user, role: m.role })),
        joined: req.userId ? group.members.some((m) => m.userId === req.userId) : false,
      },
    });
  })
);

groupsRouter.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const group = await prisma.group.findUnique({ where: { id: req.params.id } });
    if (!group) throw new HttpError(404, "Group not found");
    if (group.adminId !== req.userId) throw new HttpError(403, "Only the group admin can delete this group");
    await prisma.group.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

groupsRouter.post(
  "/:id/join",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const group = await prisma.group.findUnique({ where: { id: req.params.id } });
    if (!group) throw new HttpError(404, "Group not found");
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: req.params.id, userId: req.userId! } },
      create: { groupId: req.params.id, userId: req.userId! },
      update: {},
    });
    res.status(204).end();
  })
);

groupsRouter.delete(
  "/:id/join",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const group = await prisma.group.findUnique({ where: { id: req.params.id } });
    if (group && group.adminId === req.userId) throw new HttpError(400, "Admin cannot leave their own group — delete it instead");
    await prisma.groupMember
      .delete({ where: { groupId_userId: { groupId: req.params.id, userId: req.userId! } } })
      .catch(() => undefined);
    res.status(204).end();
  })
);

groupsRouter.get(
  "/:id/updates",
  asyncHandler(async (req, res) => {
    const updates = await prisma.groupUpdate.findMany({
      where: { groupId: req.params.id },
      include: { author: { select: { id: true, fullName: true, handle: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ updates });
  })
);

const createUpdateSchema = z.object({ content: z.string().min(1).max(2000) });

groupsRouter.post(
  "/:id/updates",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const { content } = createUpdateSchema.parse(req.body);
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: req.params.id, userId: req.userId! } },
    });
    if (!membership) throw new HttpError(403, "Join the group to post updates");

    const update = await prisma.groupUpdate.create({
      data: { groupId: req.params.id, authorId: req.userId!, content },
      include: { author: { select: { id: true, fullName: true, handle: true } } },
    });
    await publishEvent({ type: "group:update", payload: update });
    res.status(201).json({ update });
  })
);

const createInviteSchema = z.object({ inviteeId: z.string().uuid() });

groupsRouter.post(
  "/:id/invites",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const { inviteeId } = createInviteSchema.parse(req.body);
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: req.params.id, userId: req.userId! } },
    });
    if (!membership) throw new HttpError(403, "Join the group to invite others");

    const invite = await prisma.groupInvite.upsert({
      where: { groupId_inviteeId: { groupId: req.params.id, inviteeId } },
      create: { groupId: req.params.id, inviterId: req.userId!, inviteeId },
      update: { status: "PENDING" },
      include: { group: { select: { name: true } } },
    });
    await notifyUser(inviteeId, "invite", "Group invite", `You've been invited to join ${invite.group.name}.`);
    await publishEvent({ type: "invite:new", targetUserIds: [inviteeId], payload: invite });
    res.status(201).json({ invite });
  })
);

groupsRouter.get(
  "/invites/received",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const invites = await prisma.groupInvite.findMany({
      where: { inviteeId: req.userId!, status: "PENDING" },
      include: { group: true, inviter: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ invites });
  })
);

const respondInviteSchema = z.object({ status: z.enum(["ACCEPTED", "DECLINED"]) });

groupsRouter.patch(
  "/invites/:inviteId",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const { status } = respondInviteSchema.parse(req.body);
    const invite = await prisma.groupInvite.findUnique({ where: { id: req.params.inviteId } });
    if (!invite || invite.inviteeId !== req.userId) throw new HttpError(404, "Invite not found");

    await prisma.groupInvite.update({ where: { id: invite.id }, data: { status } });
    if (status === "ACCEPTED") {
      await prisma.groupMember.upsert({
        where: { groupId_userId: { groupId: invite.groupId, userId: req.userId! } },
        create: { groupId: invite.groupId, userId: req.userId! },
        update: {},
      });
    }
    res.status(204).end();
  })
);
