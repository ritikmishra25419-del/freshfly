import { Response } from "express";
import prisma from "../config/prisma";
import type { AuthRequest } from "../middleware/authMiddleware";

export const getMyConversations = async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { fresherUserId: req.userId },
          { clientUserId: req.userId },
        ],
      },
      include: {
        fresher: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } },
        application: {
          include: { job: { select: { id: true, title: true } } },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    res.json({ conversations });
  } catch (err) {
    console.error("Get conversations error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const conversationId = Number(req.params.conversationId);

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    if (
      conversation.fresherUserId !== req.userId &&
      conversation.clientUserId !== req.userId
    ) {
      return res.status(403).json({ message: "Not your conversation." });
    }

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: req.userId },
        read: false,
      },
      data: { read: true },
    });

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({ messages });
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const conversationId = Number(req.params.conversationId);
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Message cannot be empty." });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    if (
      conversation.fresherUserId !== req.userId &&
      conversation.clientUserId !== req.userId
    ) {
      return res.status(403).json({ message: "Not your conversation." });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: req.userId!,
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, name: true } },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({ message });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const createConversation = async (
  applicationId: number,
  fresherUserId: number,
  clientUserId: number
) => {
  try {
    const existing = await prisma.conversation.findUnique({
      where: { applicationId },
    });
    if (existing) return existing;

    return await prisma.conversation.create({
      data: { applicationId, fresherUserId, clientUserId },
    });
  } catch (err) {
    console.error("Create conversation error:", err);
  }
};