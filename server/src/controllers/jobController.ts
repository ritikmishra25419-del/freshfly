import { Request, Response } from "express";
import prisma from "../config/prisma";
import type { AuthRequest } from "../middleware/authMiddleware";

export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, budget, tierRequired, skills, isRemote, category } = req.body;

    if (!title || !description || !budget || !skills) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { role: true },
    });

    if (!user || user.role.name !== "CLIENT") {
      return res.status(403).json({ message: "Only clients can post jobs." });
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        budget: parseFloat(budget),
        tierRequired: tierRequired || 1,
        skills,
        isRemote: isRemote ?? true,
        category: category || "WEB_DEV",
        clientId: req.userId!,
      },
      include: { client: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json({ message: "Job posted successfully.", job });
  } catch (err) {
    console.error("Create job error:", err);
    res.status(500).json({ message: "Something went wrong posting the job." });
  }
};

export const getJobs = async (req: AuthRequest, res: Response) => {
  try {
    const { search, category, minBudget, maxBudget, tier } = req.query;

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { role: true, profile: true },
    });

    if (!user) return res.status(404).json({ message: "User not found." });

    const baseWhere: any = { status: "OPEN" };

    if (user.role.name === "FRESHER") {
      const userTier = user.profile?.tier || 1;
      baseWhere.tierRequired = { lte: userTier };
    }

    if (search) {
      baseWhere.OR = [
        { title: { contains: String(search) } },
        { description: { contains: String(search) } },
        { skills: { contains: String(search) } },
      ];
    }

    if (category && category !== 'ALL') {
      baseWhere.category = String(category);
    }

    if (minBudget) {
      baseWhere.budget = { ...baseWhere.budget, gte: parseFloat(String(minBudget)) };
    }

    if (maxBudget) {
      baseWhere.budget = { ...baseWhere.budget, lte: parseFloat(String(maxBudget)) };
    }

    if (tier && tier !== 'ALL') {
      baseWhere.tierRequired = Number(tier);
    }

    const jobs = await prisma.job.findMany({
      where: baseWhere,
      include: { client: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json({ jobs });
  } catch (err) {
    console.error("Get jobs error:", err);
    res.status(500).json({ message: "Something went wrong fetching jobs." });
  }
};

export const getJobById = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid job id." });
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: { client: { select: { id: true, name: true, email: true } } },
    });

    if (!job) return res.status(404).json({ message: "Job not found." });

    res.json({ job });
  } catch (err) {
    console.error("Get job by id error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const getMyJobs = async (req: AuthRequest, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { clientId: req.userId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ jobs });
  } catch (err) {
    console.error("Get my jobs error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const closeJob = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    const job = await prisma.job.findUnique({ where: { id } });

    if (!job) return res.status(404).json({ message: "Job not found." });
    if (job.clientId !== req.userId) {
      return res.status(403).json({ message: "You can only close your own jobs." });
    }

    const updated = await prisma.job.update({
      where: { id },
      data: { status: "CLOSED" },
    });

    res.json({ message: "Job closed.", job: updated });
  } catch (err) {
    console.error("Close job error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};