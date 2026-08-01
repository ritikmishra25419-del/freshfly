import { Response } from "express";
import prisma from "../config/prisma";
import type { AuthRequest } from "../middleware/authMiddleware";

export const getPosts = async (req: AuthRequest, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: { select: { id: true, name: true, role: { select: { name: true } }, profile: { select: { tier: true } } } },
        comments: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
        reactions: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ posts });
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, type } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    const validTypes = ["QUESTION", "SHOWCASE", "FEEDBACK", "DISCUSSION"];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid post type." });
    }

    const post = await prisma.post.create({
      data: {
        userId: req.userId!,
        title,
        content,
        type: type || "DISCUSSION",
      },
      include: {
  user: { select: { id: true, name: true, role: { select: { name: true } }, profile: { select: { tier: true } } } },
  comments: { include: { user: { select: { id: true, name: true } } } },
  reactions: true,
},
    });

    res.status(201).json({ post });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const postId = Number(req.params.id);
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty." });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: "Post not found." });

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: req.userId!,
        content: content.trim(),
      },
      include: { user: { select: { id: true, name: true } } },
    });

    res.status(201).json({ comment });
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const reactToPost = async (req: AuthRequest, res: Response) => {
  try {
    const postId = Number(req.params.id);
    const { type } = req.body;

    const validTypes = ["LIKE", "FIRE", "CLAP"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid reaction type." });
    }

    const existing = await prisma.reaction.findUnique({
      where: { postId_userId: { postId, userId: req.userId! } },
    });

    if (existing) {
      if (existing.type === type) {
        await prisma.reaction.delete({
          where: { postId_userId: { postId, userId: req.userId! } },
        });
        return res.json({ message: "Reaction removed.", action: "removed" });
      } else {
        const updated = await prisma.reaction.update({
          where: { postId_userId: { postId, userId: req.userId! } },
          data: { type: type as any },
        });
        return res.json({ message: "Reaction updated.", reaction: updated, action: "updated" });
      }
    }

    const reaction = await prisma.reaction.create({
      data: { postId, userId: req.userId!, type: type as any },
    });

    res.status(201).json({ message: "Reaction added.", reaction, action: "added" });
  } catch (err) {
    console.error("React to post error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (post.userId !== req.userId) {
      return res.status(403).json({ message: "You can only delete your own posts." });
    }

    await prisma.reaction.deleteMany({ where: { postId: id } });
    await prisma.comment.deleteMany({ where: { postId: id } });
    await prisma.post.delete({ where: { id } });

    res.json({ message: "Post deleted." });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};