import { prisma } from "../db.js";

export interface ProfileDto {
  id: string;
  name: string;
  handle: string;
  email: string;
  origin: string | null;
  host: string | null;
  city: string | null;
  bio: string;
  followers: number;
  following: number;
  notificationsEnabled: boolean;
}

export async function loadProfile(userId: string): Promise<ProfileDto | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { _count: { select: { followers: true, following: true } } },
  });
  if (!user) return null;
  return {
    id: user.id,
    name: user.fullName,
    handle: user.handle,
    email: user.email,
    origin: user.origin,
    host: user.host,
    city: user.city,
    bio: user.bio,
    followers: user._count.followers,
    following: user._count.following,
    notificationsEnabled: user.notificationsEnabled,
  };
}
