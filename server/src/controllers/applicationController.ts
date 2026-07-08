import { Response } from "express";
import prisma from "../config/prisma";
import type { AuthRequest } from "../middleware/authMiddleware";

export const applyToJob = async (req: AuthRequest, res: Response) => {
  try {
    const jobId = Number(req.params.jobId);
    const { coverLetter } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { role: true },
    });

    if (!user || user.role.name !== "FRESHER") {
      return res.status(403).json({ message: "Only freshers can apply to jobs." });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ message: "Job not found." });
    if (job.status !== "OPEN") return res.status(400).json({ message: "This job is no longer open." });

    const existing = await prisma.application.findUnique({
      where: { jobId_fresherId: { jobId, fresherId: req.userId! } },
    });
    if (existing) return res.status(409).json({ message: "You already applied to this job." });

    const application = await prisma.application.create({
      data: { jobId, fresherId: req.userId!, coverLetter },
      include: {
        job: { select: { id: true, title: true, budget: true } },
        fresher: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ message: "Application submitted.", application });
  } catch (err) {
    console.error("Apply error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const getMyApplications = async (req: AuthRequest, res: Response) => {
  try {
    const applications = await prisma.application.findMany({
      where: { fresherId: req.userId },
      include: {
        job: {
          select: {
            id: true, title: true, budget: true, skills: true,
            client: { select: { id: true, name: true } },
          },
        },
        review: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ applications });
  } catch (err) {
    console.error("Get my applications error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const getJobApplications = async (req: AuthRequest, res: Response) => {
  try {
    const jobId = Number(req.params.jobId);

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ message: "Job not found." });
    if (job.clientId !== req.userId) {
      return res.status(403).json({ message: "You can only view applications for your own jobs." });
    }

    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        fresher: {
          select: {
            id: true, name: true, email: true,
            profile: { select: { tier: true, bio: true, hourlyRate: true } },
          },
        },
        review: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ applications });
  } catch (err) {
    console.error("Get job applications error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const validStatuses = ["ACCEPTED", "REJECTED", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!application) return res.status(404).json({ message: "Application not found." });
    if (application.job.clientId !== req.userId) {
      return res.status(403).json({ message: "You can only update applications for your own jobs." });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        fresher: { select: { id: true, name: true, email: true } },
        job: { select: { id: true, title: true } },
      },
    });

    res.json({ message: `Application ${status.toLowerCase()}.`, application: updated });
  } catch (err) {
    console.error("Update application status error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};