import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const goalsRouter = Router();

const linkSchema = z.object({ label: z.string(), url: z.string(), type: z.enum(["video", "web", "doc"]) });
const stepSchema = z.object({
  text: z.string().min(1).max(300),
  description: z.string().max(1000).default(""),
  tool: z.string().max(120).default(""),
  links: z.array(linkSchema).default([]),
});

async function requireOwnedGoal(goalId: string, userId: string) {
  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal) throw new HttpError(404, "Goal not found");
  if (goal.userId !== userId) throw new HttpError(403, "Not your goal");
  return goal;
}

goalsRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const goals = await prisma.goal.findMany({
      where: { userId: req.userId! },
      include: { steps: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ goals });
  })
);

const createGoalSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().min(1).max(80),
  iconName: z.string().max(60).default("Target"),
  steps: z.array(stepSchema).default([]),
});

goalsRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = createGoalSchema.parse(req.body);
    const goal = await prisma.goal.create({
      data: {
        userId: req.userId!,
        title: data.title,
        category: data.category,
        iconName: data.iconName,
        steps: { create: data.steps.map((s, order) => ({ ...s, order })) },
      },
      include: { steps: { orderBy: { order: "asc" } } },
    });
    res.status(201).json({ goal });
  })
);

goalsRouter.post(
  "/from-template/:templateId",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const template = await prisma.goalTemplate.findUnique({ where: { id: req.params.templateId } });
    if (!template) throw new HttpError(404, "Goal template not found");

    const steps = (template.steps as Array<{ t: string; d?: string; tool?: string; links?: unknown[] }>) ?? [];
    const goal = await prisma.goal.create({
      data: {
        userId: req.userId!,
        title: template.title,
        category: template.category,
        iconName: template.iconName,
        steps: {
          create: steps.map((s, order) => ({
            text: s.t,
            description: s.d ?? "",
            tool: s.tool ?? "",
            links: (s.links ?? []) as any,
            order,
          })),
        },
      },
      include: { steps: { orderBy: { order: "asc" } } },
    });
    res.status(201).json({ goal });
  })
);

goalsRouter.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    await requireOwnedGoal(req.params.id, req.userId!);
    await prisma.goal.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

goalsRouter.post(
  "/:id/steps",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    await requireOwnedGoal(req.params.id, req.userId!);
    const data = stepSchema.parse(req.body);
    const count = await prisma.goalStep.count({ where: { goalId: req.params.id } });
    const step = await prisma.goalStep.create({ data: { ...data, goalId: req.params.id, order: count } });
    res.status(201).json({ step });
  })
);

const updateStepSchema = z.object({
  text: z.string().min(1).max(300).optional(),
  description: z.string().max(1000).optional(),
  tool: z.string().max(120).optional(),
  done: z.boolean().optional(),
  links: z.array(linkSchema).optional(),
});

goalsRouter.patch(
  "/:id/steps/:stepId",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    await requireOwnedGoal(req.params.id, req.userId!);
    const data = updateStepSchema.parse(req.body);
    const step = await prisma.goalStep.update({ where: { id: req.params.stepId }, data });
    res.json({ step });
  })
);

goalsRouter.delete(
  "/:id/steps/:stepId",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    await requireOwnedGoal(req.params.id, req.userId!);
    await prisma.goalStep.delete({ where: { id: req.params.stepId } });
    res.status(204).end();
  })
);
