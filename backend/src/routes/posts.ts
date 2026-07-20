import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { requireAuth, optionalAuth, type AuthedRequest } from "../middleware/auth.js";
import { publishEvent } from "../ws/gateway.js";
import { notifyUser } from "../lib/notify.js";
import { cacheInvalidatePrefix } from "../redis.js";

export const postsRouter = Router();

const postInclude = (viewerId: string | undefined) =>
  ({
    author: { select: { id: true, fullName: true, handle: true } },
    tags: { include: { taggedUser: { select: { id: true, fullName: true } } } },
    _count: { select: { reactions: true, comments: true } },
    reactions: viewerId ? { where: { userId: viewerId } } : false,
    saves: viewerId ? { where: { userId: viewerId } } : false,
  }) satisfies Prisma.PostInclude;

type PostWithRelations = Prisma.PostGetPayload<{ include: ReturnType<typeof postInclude> }>;

function serializePost(post: PostWithRelations) {
  return {
    id: post.id,
    author: post.author,
    content: post.content,
    attachment: post.attachment,
    bgTheme: post.bgTheme,
    feeling: post.feeling,
    location: post.location,
    privacy: post.privacy,
    tags: post.tags.map((t) => t.taggedUser),
    createdAt: post.createdAt,
    likesCount: post._count.reactions,
    commentsCount: post._count.comments,
    myReaction: post.reactions?.[0]?.emoji ?? null,
    saved: (post.saves?.length ?? 0) > 0,
  };
}

const feedQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  authorId: z.string().uuid().optional(),
  savedOnly: z.coerce.boolean().optional(),
});

postsRouter.get(
  "/",
  optionalAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const { cursor, limit, authorId, savedOnly } = feedQuerySchema.parse(req.query);
    const viewerId = req.userId;

    if (savedOnly && !viewerId) throw new HttpError(401, "Login required to view saved posts");

    let visibility: Prisma.PostWhereInput;
    if (authorId) {
      visibility = { authorId };
    } else if (viewerId) {
      const followedIds = (
        await prisma.follow.findMany({ where: { followerId: viewerId }, select: { followingId: true } })
      ).map((f) => f.followingId);
      visibility = {
        OR: [
          { privacy: "PUBLIC" },
          { authorId: viewerId },
          { privacy: "FRIENDS", authorId: { in: followedIds } },
        ],
      };
    } else {
      visibility = { privacy: "PUBLIC" };
    }

    const where: Prisma.PostWhereInput = savedOnly
      ? { AND: [visibility, { saves: { some: { userId: viewerId! } } } as Prisma.PostWhereInput] }
      : visibility;

    const posts = await prisma.post.findMany({
      where,
      include: postInclude(viewerId),
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    res.json({
      posts: posts.map(serializePost),
      nextCursor: posts.length === limit ? posts[posts.length - 1].id : null,
    });
  })
);

const createPostSchema = z.object({
  content: z.string().min(1).max(5000),
  attachment: z.string().url().optional(),
  bgTheme: z.string().optional(),
  feeling: z.string().optional(),
  location: z.string().optional(),
  privacy: z.enum(["PUBLIC", "FRIENDS", "PRIVATE"]).default("PUBLIC"),
  taggedUserIds: z.array(z.string().uuid()).max(20).default([]),
});

postsRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = createPostSchema.parse(req.body);
    const post = await prisma.post.create({
      data: {
        authorId: req.userId!,
        content: data.content,
        attachment: data.attachment,
        bgTheme: data.bgTheme,
        feeling: data.feeling,
        location: data.location,
        privacy: data.privacy,
        tags: { create: data.taggedUserIds.map((taggedUserId) => ({ taggedUserId })) },
      },
      include: postInclude(req.userId),
    });

    await cacheInvalidatePrefix("feed:");
    if (post.privacy === "PUBLIC") await publishEvent({ type: "post:new", payload: serializePost(post) });

    res.status(201).json({ post: serializePost(post) });
  })
);

postsRouter.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) throw new HttpError(404, "Post not found");
    if (post.authorId !== req.userId) throw new HttpError(403, "You can only delete your own posts");

    await prisma.post.delete({ where: { id: req.params.id } });
    await cacheInvalidatePrefix("feed:");
    await publishEvent({ type: "post:deleted", payload: { id: req.params.id } });
    res.status(204).end();
  })
);

const reactSchema = z.object({ emoji: z.string().min(1).max(8).default("👍") });

postsRouter.put(
  "/:id/reaction",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const { emoji } = reactSchema.parse(req.body);
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) throw new HttpError(404, "Post not found");

    const reaction = await prisma.postReaction.upsert({
      where: { postId_userId: { postId: req.params.id, userId: req.userId! } },
      create: { postId: req.params.id, userId: req.userId!, emoji },
      update: { emoji },
    });

    if (post.authorId !== req.userId) {
      const me = await prisma.user.findUnique({ where: { id: req.userId! }, select: { fullName: true } });
      await notifyUser(post.authorId, "reaction", "New reaction", `${me?.fullName ?? "Someone"} reacted to your post.`);
      await publishEvent({ type: "reaction:new", targetUserIds: [post.authorId], payload: { postId: post.id, emoji } });
    }

    res.json({ reaction });
  })
);

postsRouter.delete(
  "/:id/reaction",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    await prisma.postReaction
      .delete({ where: { postId_userId: { postId: req.params.id, userId: req.userId! } } })
      .catch(() => undefined);
    res.status(204).end();
  })
);

postsRouter.put(
  "/:id/save",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    await prisma.postSave.upsert({
      where: { postId_userId: { postId: req.params.id, userId: req.userId! } },
      create: { postId: req.params.id, userId: req.userId! },
      update: {},
    });
    res.status(204).end();
  })
);

postsRouter.delete(
  "/:id/save",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    await prisma.postSave
      .delete({ where: { postId_userId: { postId: req.params.id, userId: req.userId! } } })
      .catch(() => undefined);
    res.status(204).end();
  })
);

postsRouter.post(
  "/:id/share",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) throw new HttpError(404, "Post not found");
    await prisma.postShare.create({ data: { postId: req.params.id, userId: req.userId! } });
    res.status(201).end();
  })
);

// --- Comments ---

postsRouter.get(
  "/:id/comments",
  asyncHandler(async (req, res) => {
    const comments = await prisma.comment.findMany({
      where: { postId: req.params.id },
      include: { author: { select: { id: true, fullName: true, handle: true } } },
      orderBy: { createdAt: "asc" },
    });
    res.json({ comments });
  })
);

const createCommentSchema = z.object({ content: z.string().min(1).max(2000) });

postsRouter.post(
  "/:id/comments",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const { content } = createCommentSchema.parse(req.body);
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) throw new HttpError(404, "Post not found");

    const comment = await prisma.comment.create({
      data: { postId: req.params.id, authorId: req.userId!, content },
      include: { author: { select: { id: true, fullName: true, handle: true } } },
    });

    if (post.authorId !== req.userId) {
      await notifyUser(post.authorId, "comment", "New comment", `${comment.author.fullName} commented on your post.`);
    }
    await publishEvent({ type: "comment:new", payload: comment });

    res.status(201).json({ comment });
  })
);
