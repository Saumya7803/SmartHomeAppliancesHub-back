import { logAudit } from "../utils/audit.js";

function shouldSkipRequestLog(req) {
  return !req.originalUrl.startsWith("/api") || req.originalUrl === "/api/health";
}

export function apiRequestLogger(req, res, next) {
  if (shouldSkipRequestLog(req)) {
    return next();
  }

  const startTime = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;

    void logAudit({
      userId: req.user?.id || null,
      action: "api_request",
      entityType: "request",
      details: {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Number(durationMs.toFixed(2)),
      },
    }).catch(() => {});
  });

  return next();
}
