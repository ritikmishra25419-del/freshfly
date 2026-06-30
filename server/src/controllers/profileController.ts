import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { profile: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      tier: user.profile?.tier,
      bio: user.profile?.bio,
      education: user.profile?.education,
      hourlyRate: user.profile?.hourlyRate,
      availability: user.profile?.availability,
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Something went wrong fetching profile." });
  }
};

export const getProfileById = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid user id." });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      id: user.id,
      name: user.name,
      role: user.role.name,
      tier: user.profile?.tier,
      bio: user.profile?.bio,
      education: user.profile?.education,
      availability: user.profile?.availability,
    });
  } catch (err) {
    console.error("Get profile by id error:", err);
    res.status(500).json({ message: "Something went wrong fetching profile." });
  }
};

export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { bio, education, resumeUrl, githubUrl, linkedinUrl, hourlyRate, availability } = req.body;

    const updated = await prisma.profile.update({
      where: { userId: req.userId },
      data: { bio, education, resumeUrl, githubUrl, linkedinUrl, hourlyRate, availability },
    });

    res.json({ message: "Profile updated.", profile: updated });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Something went wrong updating profile." });
  }
};
