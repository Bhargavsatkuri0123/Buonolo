import { prisma } from "../db.js";

export async function generateUniqueHandle(fullName: string): Promise<string> {
  const base = fullName.trim().replace(/\s+/g, "").toLowerCase().replace(/[^a-z0-9]/g, "") || "user";
  let candidate = base;
  let suffix = 0;
  // Small, bounded loop: collisions on a fresh handle are rare, this only iterates when they happen.
  while (await prisma.user.findUnique({ where: { handle: candidate }, select: { id: true } })) {
    suffix += 1;
    candidate = `${base}${suffix}`;
  }
  return candidate;
}
