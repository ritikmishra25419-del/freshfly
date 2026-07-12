import { Response } from "express";
import prisma from "../config/prisma";
import type { AuthRequest } from "../middleware/authMiddleware";

export const addPortfolioItem = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, techStack, githubUrl, liveUrl } = req.body;

    if (!title || !description || !techStack) {
      return res.status(400).json({ message: "Title, description and tech stack are required." });
    }

    const item = await prisma.portfolioItem.create({
      data: {
        userId: req.userId!,
        title,
        description,
        techStack,
        githubUrl: githubUrl || null,
        liveUrl: liveUrl || null,
      },
    });

    res.status(201).json({ message: "Portfolio item added.", item });
  } catch (err) {
    console.error("Add portfolio error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const getMyPortfolio = async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.portfolioItem.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ items });
  } catch (err) {
    console.error("Get my portfolio error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const getUserPortfolio = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.params.userId);

    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user id." });
    }

    const items = await prisma.portfolioItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    res.json({ items });
  } catch (err) {
    console.error("Get user portfolio error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const deletePortfolioItem = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    const item = await prisma.portfolioItem.findUnique({ where: { id } });

    if (!item) {
      return res.status(404).json({ message: "Portfolio item not found." });
    }

    if (item.userId !== req.userId) {
      return res.status(403).json({ message: "You can only delete your own portfolio items." });
    }

    await prisma.portfolioItem.delete({ where: { id } });

    res.json({ message: "Portfolio item deleted." });
  } catch (err) {
    console.error("Delete portfolio error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const updatePortfolioItem = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { title, description, techStack, githubUrl, liveUrl } = req.body;

    const item = await prisma.portfolioItem.findUnique({ where: { id } });

    if (!item) {
      return res.status(404).json({ message: "Portfolio item not found." });
    }

    if (item.userId !== req.userId) {
      return res.status(403).json({ message: "You can only edit your own portfolio items." });
    }

    const updated = await prisma.portfolioItem.update({
      where: { id },
      data: { title, description, techStack, githubUrl: githubUrl || null, liveUrl: liveUrl || null },
    });

    res.json({ message: "Portfolio item updated.", item: updated });
  } catch (err) {
    console.error("Update portfolio error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};