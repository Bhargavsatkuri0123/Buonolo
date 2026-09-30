import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { cacheGetOrSet } from "../redis.js";
import { generateHostInfoTemplate } from "../lib/hostInfoTemplate.js";

export const contentRouter = Router();

// Host-country content: an admin-curated `HostInfo` DB row takes priority (host+city, then host-wide
// default); if neither exists, we generate it from the generic template so every host/city combination
// still gets sensible content out of the box.
contentRouter.get(
  "/host-info",
  asyncHandler(async (req, res) => {
    const host = String(req.query.host ?? "").trim();
    const city = String(req.query.city ?? "").trim();
    const origin = String(req.query.origin ?? "").trim();
    if (!host || !city) return res.json({ hostInfo: null, source: "none" });

    const hostInfo = await cacheGetOrSet(`host-info:${host}:${city}:${origin}`, 300, async () => {
      // findFirst (not findUnique): Postgres doesn't enforce uniqueness across NULLs in a composite unique
      // index, so Prisma won't type a null `city` into the compound-unique lookup at all.
      const curated = (await prisma.hostInfo.findFirst({ where: { host, city } })) ?? (await prisma.hostInfo.findFirst({ where: { host, city: null } }));
      if (curated) return { ...curated, source: "curated" as const };
      return { ...generateHostInfoTemplate(origin || "your home country", city, host), source: "generated" as const };
    });

    res.json({ hostInfo });
  })
);

contentRouter.get(
  "/goal-templates",
  asyncHandler(async (_req, res) => {
    const templates = await cacheGetOrSet("goal-templates:all", 300, () => prisma.goalTemplate.findMany());
    res.json({ templates });
  })
);
