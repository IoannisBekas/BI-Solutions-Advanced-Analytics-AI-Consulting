import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import {
  findUserByEmail,
  findUserById,
  findUserByReferralToken,
  createUser,
  getAppMeta,
  updateUserCredits,
  updateUserAuthProvider,
  deleteUser,
  resetMonthlyReports,
  setAppMeta,
  toSafeUser,
  type DbUser,
} from "./db";

// ─── Config ──────────────────────────────────────────────────────────────────
const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = "7d";
const TOKEN_COOKIE_NAME = "auth_token";
const TOKEN_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const EPHEMERAL_JWT_SECRET = crypto.randomBytes(32).toString("hex");
const MONTHLY_RESET_META_KEY = "reports.last_reset_month";

function setAuthCookie(res: Response, token: string) {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_COOKIE_MAX_AGE_MS,
  });
}

function clearAuthCookie(res: Response) {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie(TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  });
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET env var is required in production");
  }

  console.warn("JWT_SECRET not set — using an ephemeral development secret for this process.");
  return EPHEMERAL_JWT_SECRET;
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
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
  const cookieToken = cookies?.[TOKEN_COOKIE_NAME];
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;
  const token = cookieToken || headerToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as JWTPayload;
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
  authProvider?: "password" | "google";
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
    authProvider: params.authProvider ?? "password",
  });
}

function mergeAuthProvider(current: string | undefined, incoming: "password" | "google") {
  if (!current || current === incoming) {
    return incoming;
  }

  if (current === "hybrid") {
    return current;
  }

  return "hybrid";
}

async function verifyDeletionChallenge(user: DbUser, body: Record<string, unknown> | undefined) {
  const password = typeof body?.password === "string" ? body.password : "";
  const googleCredential = typeof body?.googleCredential === "string"
    ? body.googleCredential.trim()
    : "";
  const authProvider = user.auth_provider || "password";

  if (authProvider === "google") {
    if (!googleCredential) {
      return { status: 400, error: "Google account deletion requires a fresh Google sign-in credential." };
    }

    let tokenInfo: GoogleTokenInfo;
    try {
      tokenInfo = await verifyGoogleCredential(googleCredential);
    } catch {
      return { status: 401, error: "Google credential verification failed." };
    }

    if (tokenInfo.email?.toLowerCase() !== user.email.toLowerCase()) {
      return { status: 401, error: "Google credential does not match the signed-in account." };
    }

    return null;
  }

  if (authProvider === "hybrid") {
    if (googleCredential) {
      let tokenInfo: GoogleTokenInfo;
      try {
        tokenInfo = await verifyGoogleCredential(googleCredential);
      } catch {
        return { status: 401, error: "Google credential verification failed." };
      }

      if (tokenInfo.email?.toLowerCase() !== user.email.toLowerCase()) {
        return { status: 401, error: "Google credential does not match the signed-in account." };
      }

      return null;
    }

    if (!password) {
      return { status: 400, error: "Confirm deletion with your password or a fresh Google sign-in credential." };
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    return valid ? null : { status: 401, error: "Incorrect password" };
  }

  if (!password) {
    return { status: 400, error: "Password confirmation is required to delete your account." };
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  return valid ? null : { status: 401, error: "Incorrect password" };
}

interface GoogleTokenInfo {
  aud: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
}

let cachedGoogleOAuthClient: OAuth2Client | null = null;
let cachedGoogleOAuthClientId = "";

function getGoogleOAuthClient(clientId: string): OAuth2Client {
  if (!cachedGoogleOAuthClient || cachedGoogleOAuthClientId !== clientId) {
    cachedGoogleOAuthClient = new OAuth2Client(clientId);
    cachedGoogleOAuthClientId = clientId;
  }
  return cachedGoogleOAuthClient;
}

async function verifyGoogleCredential(idToken: string): Promise<GoogleTokenInfo> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error("Google sign-in is not configured");
  }

  const client = getGoogleOAuthClient(clientId);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("Google credential has no payload");
  }
  if (payload.aud !== clientId) {
    throw new Error("Google client ID mismatch");
  }
  if (!payload.email || payload.email_verified !== true) {
    throw new Error("Google account email is missing or unverified");
  }

  return {
    aud: payload.aud,
    email: payload.email,
    email_verified: payload.email_verified,
    name: payload.name,
  };
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

    const user = await createAuthUser({
      email,
      name,
      password,
      referralToken,
      authProvider: "password",
    });

    const token = signToken(user);
    setAuthCookie(res, token);
    res.status(201).json({ user: toSafeUser(user) });
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
    setAuthCookie(res, token);
    res.json({ user: toSafeUser(user) });
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
        authProvider: "google",
      });
    } else {
      const mergedAuthProvider = mergeAuthProvider(user.auth_provider, "google");
      if (mergedAuthProvider !== user.auth_provider) {
        updateUserAuthProvider(user.id, mergedAuthProvider);
        user = findUserById(user.id) ?? { ...user, auth_provider: mergedAuthProvider };
      }
    }

    const token = signToken(user);
    setAuthCookie(res, token);
    res.json({ user: toSafeUser(user) });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(401).json({ error: "Google authentication failed" });
  }
});

// ── POST /api/auth/logout ───────────────────────────────────────────────────
authRouter.post("/logout", (_req: Request, res: Response) => {
  clearAuthCookie(res);
  res.json({ success: true });
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
      const user = findUserById(req.user!.userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const challengeError = await verifyDeletionChallenge(
        user,
        req.body as Record<string, unknown> | undefined,
      );
      if (challengeError) {
        res.status(challengeError.status).json({ error: challengeError.error });
        return;
      }

      const deleted = deleteUser(user.id);
      if (!deleted) {
        res.status(500).json({ error: "Failed to delete account. Please try again." });
        return;
      }

      clearAuthCookie(res);
      res.json({ success: true, message: "Account permanently deleted" });
    } catch (error) {
      console.error("Account deletion error:", error);
      res.status(500).json({ error: "Account deletion failed. Please try again." });
    }
  }
);

// ── Monthly reports reset (lazy check) ──────────────────────────────────────
export function checkMonthlyReset(): void {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const lastResetMonth = getAppMeta(MONTHLY_RESET_META_KEY);

  if (!lastResetMonth) {
    setAppMeta(MONTHLY_RESET_META_KEY, currentMonth);
    return;
  }

  if (lastResetMonth !== currentMonth) {
    const resetCount = resetMonthlyReports();
    setAppMeta(MONTHLY_RESET_META_KEY, currentMonth);
    if (resetCount > 0) {
      console.log(`Monthly reset: cleared reports_this_month for ${resetCount} users`);
    }
  }
}
