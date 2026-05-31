import { verifyToken } from "../utils/jwt.js";
import { normalizeUserRole } from "../utils/roles.js";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token);
    if (payload.actorType && payload.actorType !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = {
      id: payload.sub,
      role: normalizeUserRole(payload.role),
      name: payload.name,
      email: payload.email,
    };

    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
