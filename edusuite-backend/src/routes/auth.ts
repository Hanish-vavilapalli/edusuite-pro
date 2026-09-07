import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "edusuite_super_secret_key_change_me_in_production";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

// Authentication Middleware
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. Token missing." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    req.userId = verified.id;
    req.userRole = verified.role;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token." });
  }
}

// Login Controller
router.post("/login", async (req: Request, res: Response) => {
  const { rollNumber, email, password } = req.body;
  const loginIdentifier = rollNumber || email;

  if (!loginIdentifier || !password) {
    return res.status(400).json({ error: "Please provide both username/email and password." });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginIdentifier },
          { rollNumber: loginIdentifier }
        ]
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found with these credentials." });
    }

    const validPassword = user.password === password || (await bcrypt.compare(password, user.password).catch(() => false));
    if (!validPassword) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "24h" });

    res.json({
      token,
      user: {
        id: user.id,
        rollNumber: user.rollNumber,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        semester: user.semester,
        cgpa: user.cgpa,
        creditsEarned: user.creditsEarned,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Profile Controller
router.get("/profile", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        rollNumber: true,
        name: true,
        email: true,
        role: true,
        department: true,
        semester: true,
        cgpa: true,
        creditsEarned: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Change Password Controller
router.post("/change-password", async (req: Request, res: Response) => {
  const { currentPassword, oldPassword, newPassword } = req.body;
  const oldPass = currentPassword || oldPassword;

  if (!oldPass || !newPassword) {
    return res.status(400).json({ error: "Current password and new password are required." });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long." });
  }

  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    let userId = "";

    if (token) {
      try {
        const verified = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
        userId = verified.id;
      } catch (e) {}
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    if (userId) {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      if (dbUser && dbUser.password) {
        const isValid = await bcrypt.compare(oldPass, dbUser.password);
        if (!isValid) {
          return res.status(400).json({ error: "Incorrect current password. Please verify and try again." });
        }
      }

      await prisma.user.update({
        where: { id: userId },
        data: { password: newHash }
      });
    }

    return res.json({ success: true, message: "Password updated successfully in database." });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update password." });
  }
});

export default router;
