import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { requireAuth, optionalAuth, type AuthedRequest } from "../middleware/auth.js";

export const eventsRouter = Router();

eventsRouter.get(
  "/",
  optionalAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const events = await prisma.event.findMany({
      include: {
        _count: { select: { attendees: true } },
        attendees: req.userId ? { where: { userId: req.userId } } : false,
      },
      orderBy: { date: "asc" },
    });
    res.json({
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        image: e.image,
        date: e.date,
        location: e.location,
        creatorId: e.creatorId,
        attendeesCount: e._count.attendees,
        attending: (e.attendees?.length ?? 0) > 0,
      })),
    });
  })
);

const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  image: z.string().max(8).optional(),
  date: z.coerce.date(),
  location: z.string().min(1).max(200),
});

eventsRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = createEventSchema.parse(req.body);
    const event = await prisma.event.create({ data: { ...data, creatorId: req.userId! } });
    res.status(201).json({ event });
  })
);

eventsRouter.post(
  "/:id/rsvp",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) throw new HttpError(404, "Event not found");
    await prisma.eventAttendee.upsert({
      where: { eventId_userId: { eventId: req.params.id, userId: req.userId! } },
      create: { eventId: req.params.id, userId: req.userId! },
      update: {},
    });
    res.status(204).end();
  })
);

eventsRouter.delete(
  "/:id/rsvp",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    await prisma.eventAttendee
      .delete({ where: { eventId_userId: { eventId: req.params.id, userId: req.userId! } } })
      .catch(() => undefined);
    res.status(204).end();
  })
);
