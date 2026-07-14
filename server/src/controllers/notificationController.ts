import { Response } from "express";
import prisma from "../config/prisma";
import type { AuthRequest } from "../middleware/authMiddleware";

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    const notification = await prisma.notification.findUnique({ where: { id } });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    if (notification.userId !== req.userId) {
      return res.status(403).json({ message: "Not your notification." });
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json({ message: "Marked as read." });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, read: false },
      data: { read: true },
    });

    res.json({ message: "All notifications marked as read." });
  } catch (err) {
    console.error("Mark all as read error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const createNotification = async (
  userId: number,
  type: string,
  title: string,
  message: string
) => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: type as any,
        title,
        message,
      },
    });
  } catch (err) {
    console.error("Create notification error:", err);
  }
};