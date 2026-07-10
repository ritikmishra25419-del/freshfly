import { Response } from "express";
import prisma from "../config/prisma";
import type { AuthRequest } from "../middleware/authMiddleware";

export const submitReview = async (req: AuthRequest, res: Response) => {
  try {
    const { applicationId, rating, review } = req.body;

    if (!applicationId || !rating || !review) {
      return res.status(400).json({ message: "Application ID, rating, and review are required." });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const mentor = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { role: true },
    });

    if (!mentor || mentor.role.name !== "MENTOR") {
      return res.status(403).json({ message: "Only mentors can submit reviews." });
    }

    const application = await prisma.application.findUnique({
      where: { id: Number(applicationId) },
      include: { review: true },
    });

    if (!application) return res.status(404).json({ message: "Application not found." });
    if (application.status !== "COMPLETED") {
      return res.status(400).json({ message: "Can only review completed applications." });
    }
    if (application.review) {
      return res.status(409).json({ message: "This application already has a review." });
    }

    const mentorReview = await prisma.mentorReview.create({
      data: {
        applicationId: Number(applicationId),
        mentorId: req.userId!,
        fresherId: application.fresherId,
        rating: Number(rating),
        review,
      },
      include: {
        mentor: { select: { id: true, name: true } },
        fresher: { select: { id: true, name: true } },
      },
    });

    await checkAndUpgradeTier(application.fresherId);

    res.status(201).json({ message: "Review submitted.", review: mentorReview });
  } catch (err) {
    console.error("Submit review error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const getFresherReviews = async (req: AuthRequest, res: Response) => {
  try {
    const fresherId = Number(req.params.fresherId);

    const reviews = await prisma.mentorReview.findMany({
      where: { fresherId },
      include: {
        mentor: { select: { id: true, name: true } },
        application: {
          include: { job: { select: { id: true, title: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({ reviews, avgRating: Math.round(avgRating * 10) / 10 });
  } catch (err) {
    console.error("Get fresher reviews error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const getPendingReviews = async (req: AuthRequest, res: Response) => {
  try {
    const mentor = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { role: true },
    });

    if (!mentor || mentor.role.name !== "MENTOR") {
      return res.status(403).json({ message: "Only mentors can view review queue." });
    }

    const completedApplications = await prisma.application.findMany({
      where: {
        status: "COMPLETED",
        review: null,
      },
      include: {
        fresher: {
          select: {
            id: true, name: true,
            profile: { select: { tier: true } },
          },
        },
        job: { select: { id: true, title: true, skills: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    res.json({ applications: completedApplications });
  } catch (err) {
    console.error("Get pending reviews error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

async function checkAndUpgradeTier(fresherId: number) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: fresherId },
    });

    if (!profile) return;

    const completedApps = await prisma.application.count({
      where: { fresherId, status: "COMPLETED" },
    });

    const reviews = await prisma.mentorReview.findMany({
      where: { fresherId },
    });

    const reviewCount = reviews.length;
    const avgRating = reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

    let newTier = profile.tier || 1;

    if (profile.tier === 1 && completedApps >= 3 && avgRating >= 4.0 && reviewCount >= 1) {
      newTier = 2;
    } else if (profile.tier === 2 && completedApps >= 8 && avgRating >= 4.5 && reviewCount >= 3) {
      newTier = 3;
    }

    if (newTier !== profile.tier) {
      await prisma.profile.update({
        where: { userId: fresherId },
        data: { tier: newTier },
      });
      console.log(`Fresher ${fresherId} upgraded to Tier ${newTier}`);
    }
  } catch (err) {
    console.error("Tier check error:", err);
  }
}
export const getMyReviewsAsMentor = async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await prisma.mentorReview.findMany({
      where: { mentorId: req.userId },
      include: {
        fresher: {
          select: {
            id: true, name: true,
            profile: { select: { tier: true } },
          },
        },
        application: {
          include: { job: { select: { id: true, title: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ reviews });
  } catch (err) {
    console.error('Get mentor reviews error:', err);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};