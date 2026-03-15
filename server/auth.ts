import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  findUserByEmail,
  findUserById,
  findUserByReferralToken,
  createUser,
  updateUserCredits,
  toSafeUser,
  type DbUser,
} from "./db";

// ─── Config ──────────────────────────────────────────────────────────────────
const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = "7d";

function getJwtSecret(): string {
  return process.env.JWT_SECRET || "dev-secret-do-not-use-in-production";
}

// ─── JWT helpers ─────────────────────────────────────────────────────────────
export interface JWTPayload {
  userId: string;
  email: string;
  tier: string;
  name?: string;
  credits?: number;
  reportsThisMonth?: number;
  jurisdiction?: "US" | "UK" | "EU" | "GLOBAL";
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

function signToken(user: DbUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    tier: user.tier,
    credits: user.credits,
    reportsThisMonth: user.reports_this_month,
    jurisdiction: user.jurisdiction as JWTPayload["jurisdiction"],
  };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: TOKEN_EXPIRY });
}

/** Middleware: attach user to req if valid Bearer token present */
export function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(
        authHeader.slice(7),
        getJwtSecret()
      ) as JWTPayload;
      req.user = decoded;
    } catch {
      /* invalid/expired token — proceed as anonymous */
    }
  }
  next();
}

/** Middleware: require authentication (401 if missing) */
export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  optionalAuth(req, res, () => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    next();
  });
}

// ─── Router ──────────────────────────────────────────────────────────────────
export const authRouter = Router();

// ── POST /api/auth/register ──────────────────────────────────────────────────
authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, name, password, referralToken } = req.body;

    if (!email || !name || !password) {
      res
        .status(400)
        .json({ error: "Email, name, and password are required" });
      return;
    }

    if (typeof password !== "string" || password.length < 8) {
      res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
      return;
    }

    // Check for existing user
    const existing = findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    // Handle referral bonus
    let bonusCredits = 0;
    if (referralToken && typeof referralToken === "string") {
      const referrer = findUserByReferralToken(referralToken);
      if (referrer) {
        bonusCredits = 5;
        // Also give the referrer bonus credits
        updateUserCredits(referrer.id, referrer.credits + 3);
      }
    }

    const userId = `usr_${crypto.randomBytes(6).toString("hex")}`;
    const myReferralToken = `ref_${crypto.randomBytes(8).toString("hex")}`;
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = createUser({
      id: userId,
      email,
      name,
      passwordHash,
      credits: bonusCredits,
      referralToken: myReferralToken,
    });

    const token = signToken(user);
    res.status(201).json({ token, user: toSafeUser(user) });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = signToken(user);
    res.json({ token, user: toSafeUser(user) });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
authRouter.get(
  "/me",
  requireAuth,
  (req: AuthenticatedRequest, res: Response) => {
    // Re-fetch from DB to get fresh credits/tier
    const user = findUserById(req.user!.userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(toSafeUser(user));
  }
);
