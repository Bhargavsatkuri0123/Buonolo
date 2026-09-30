import { prisma } from "../db.js";
import { publishEvent } from "../ws/gateway.js";

export async function notifyUser(userId: string, type: string, title: string, body: string): Promise<void> {
  const notification = await prisma.notification.create({
    data: { userId, type, title, body },
  });
  await publishEvent({
    type: "notification:new",
    targetUserIds: [userId],
    payload: notification,
  });
}
