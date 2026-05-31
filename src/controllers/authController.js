import { isDatabaseConnectionError } from "../config/db.js";
import { findUserByEmail, findUserById } from "../models/userModel.js";
import { logAuditSafely } from "../utils/audit.js";
import { verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { normalizeUserRole } from "../utils/roles.js";

export async function login(req, res, next) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const normalizedStatus = String(user.status || "active").trim().toLowerCase();
    if (normalizedStatus === "suspended") {
      return res.status(403).json({ message: "Account suspended. Contact super admin." });
    }

    if (normalizedStatus === "disabled") {
      return res.status(403).json({ message: "Account disabled. Contact super admin." });
    }

    const normalizedRole = normalizeUserRole(user.role);
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user);

    void logAuditSafely({
      userId: user.id,
      action: "login",
      entityType: "auth",
      details: { email: user.email },
    });

    return res.json({
      user_id: user.id,
      email: user.email,
      role: normalizedRole,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: normalizedRole,
        status: normalizedStatus,
      },
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return res.status(503).json({ message: "Database connection failed" });
    }

    return next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      user: {
        ...user,
        role: normalizeUserRole(user.role),
        status: String(user.status || "active").trim().toLowerCase(),
      },
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return res.status(503).json({ message: "Database connection failed" });
    }

    return next(error);
  }
}
