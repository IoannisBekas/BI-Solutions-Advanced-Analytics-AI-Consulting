import type { RequestHandler } from "express";

export const APEX_HOST = "bisolutions.group";

/** Apply in production after configuring the trusted proxy boundary. */
export function canonicalHostRedirect(
  canonicalHost = "www.bisolutions.group",
): RequestHandler {
  return (req, res, next) => {
    if (req.hostname.toLowerCase() !== APEX_HOST || canonicalHost === APEX_HOST) {
      next();
      return;
    }

    // originalUrl retains encoded paths and the complete, unmodified query.
    res.redirect(308, `https://${canonicalHost}${req.originalUrl}`);
  };
}
