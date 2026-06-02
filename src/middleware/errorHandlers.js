import { isDatabaseConnectionError } from "../config/db.js";
import { logAudit } from "../utils/audit.js";

export function notFoundHandler(req, res) {
  res.status(404).json({ message: "Route not found" });
}

function isPacketTooLargeError(error) {
  if (error?.code === "ER_NET_PACKET_TOO_LARGE") {
    return true;
  }

  const message = String(error?.message || "").toLowerCase();
  return message.includes("max_allowed_packet") || message.includes("packet bigger");
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (isDatabaseConnectionError(error)) {
    return res.status(503).json({
      message: "Database connection failed",
    });
  }

  if (isPacketTooLargeError(error)) {
    return res.status(413).json({
      message: "Uploaded file is too large. Use image up to 1 MB and datasheet PDF up to 1.5 MB.",
    });
  }

  const statusCode = error.statusCode || 500;
  const normalizedMessage =
    typeof error.message === "string" && error.message.trim().length
      ? error.message
      : "Internal server error";

  void logAudit({
    userId: req.user?.id || null,
    action: "api_error",
    entityType: "system",
    details: {
      path: req.originalUrl,
      method: req.method,
      statusCode,
      message: normalizedMessage,
      code: error.code || null,
    },
  }).catch(() => {});

  return res.status(statusCode).json({ message: normalizedMessage });
}
