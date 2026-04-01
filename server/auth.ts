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
  deleteUser,
  resetMonthlyReports,
  toSafeUser,
  type DbUser,
} from "./db";

// ─── Config ──────────────────────────────────────────────────────────────────
const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = "7d";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Fallback for environments where JWT_SECRET is not yet configured.
    // Auth will work but tokens are not secure until a real secret is set.
    console.warn("JWT_SECRET not set — using insecure fallback. Set JWT_SECRET env var in production!");
    return "bisolutions-insecure-fallback-change-me";
  }
  return secret;
}

function getGoogleClientId(): string {
  return process.env.GOOGLE_CLIENT_ID?.trim() || "";
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

// ─── Validation helpers ─────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && EMAIL_RE.test(value) && value.length <= 254;
}

function applyReferralBonus(referralToken: unknown): number {
  if (typeof referralToken !== "string" || referralToken.length === 0) {
    return 0;
  }

  const referrer = findUserByReferralToken(referralToken);
  if (!referrer) {
    return 0;
  }

  updateUserCredits(referrer.id, referrer.credits + 3);
  return 5;
}

function buildUserIdentity(name: string | undefined, email: string) {
  return {
    userId: `usr_${crypto.randomBytes(6).toString("hex")}`,
    referralToken: `ref_${crypto.randomBytes(8).toString("hex")}`,
    name: (typeof name === "string" && name.trim()) || email.split("@")[0],
  };
}

async function createAuthUser(params: {
  email: string;
  name?: string;
  password: string;
  referralToken?: unknown;
}): Promise<DbUser> {
  const identity = buildUserIdentity(params.name, params.email);
  const passwordHash = await bcrypt.hash(params.password, SALT_ROUNDS);
  const credits = applyReferralBonus(params.referralToken);

  return createUser({
    id: identity.userId,
    email: params.email,
    name: identity.name,
    passwordHash,
    credits,
    referralToken: identity.referralToken,
  });
}

interface GoogleTokenInfo {
  aud: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
}

async function verifyGoogleCredential(idToken: string): Promise<GoogleTokenInfo> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error("Google sign-in is not configured");
  }

  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    { signal: AbortSignal.timeout(10_000) }
  );

  if (!response.ok) {
    throw new Error("Google rejected the credential");
  }

  const tokenInfo = (await response.json()) as GoogleTokenInfo;
  if (tokenInfo.aud !== clientId) {
    throw new Error("Google client ID mismatch");
  }
  if (!tokenInfo.email || `${tokenInfo.email_verified}` !== "true") {
    throw new Error("Google account email is missing or unverified");
  }

  return tokenInfo;
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

    if (!isValidEmail(email)) {
      res.status(400).json({ error: "Invalid email address" });
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

    const user = await createAuthUser({ email, name, password, referralToken });

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

// ── GET /api/auth/google/config ─────────────────────────────────────────────
authRouter.get("/google/config", (_req: Request, res: Response) => {
  const clientId = getGoogleClientId();
  res.json({
    enabled: Boolean(clientId),
    clientId: clientId || undefined,
  });
});

// ── POST /api/auth/google ───────────────────────────────────────────────────
authRouter.post("/google", async (req: Request, res: Response) => {
  try {
    const credential =
      typeof req.body?.credential === "string" ? req.body.credential.trim() : "";
    const referralToken = req.body?.referralToken;

    if (!credential) {
      res.status(400).json({ error: "Google credential is required" });
      return;
    }

    if (!getGoogleClientId()) {
      res.status(503).json({ error: "Google sign-in is not configured" });
      return;
    }

    const tokenInfo = await verifyGoogleCredential(credential);
    let user = findUserByEmail(tokenInfo.email!);

    if (!user) {
      const generatedPassword = crypto.randomBytes(24).toString("hex");
      user = await createAuthUser({
        email: tokenInfo.email!,
        name: tokenInfo.name,
        password: generatedPassword,
        referralToken,
      });
    }

    const token = signToken(user);
    res.json({ token, user: toSafeUser(user) });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(401).json({ error: "Google authentication failed" });
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

// ── DELETE /api/auth/account — GDPR Art. 17 Right to Erasure ────────────────
authRouter.delete(
  "/account",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { password } = req.body;

      if (!password || typeof password !== "string") {
        res.status(400).json({ error: "Password confirmation is required to delete your account" });
        return;
      }

      const user = findUserById(req.user!.userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // Require password confirmation before deletion
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        res.status(401).json({ error: "Incorrect password" });
        return;
      }

      const deleted = deleteUser(user.id);
      if (!deleted) {
        res.status(500).json({ error: "Failed to delete account. Please try again." });
        return;
      }

      res.json({ success: true, message: "Account permanently deleted" });
    } catch (error) {
      console.error("Account deletion error:", error);
      res.status(500).json({ error: "Account deletion failed. Please try again." });
    }
  }
);

// ── Monthly reports reset (lazy check) ──────────────────────────────────────
let _lastResetMonth = -1;

export function checkMonthlyReset(): void {
  const currentMonth = new Date().getMonth();
  if (_lastResetMonth !== currentMonth) {
    const resetCount = resetMonthlyReports();
    if (resetCount > 0) {
      console.log(`Monthly reset: cleared reports_this_month for ${resetCount} users`);
    }
    _lastResetMonth = currentMonth;
  }
}
