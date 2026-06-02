import { normalizeUserRole } from "../utils/roles.js";

export function requireRole(...roles) {
  const allowedRoles = roles.flat().map(normalizeUserRole);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (allowedRoles.length && !allowedRoles.includes(normalizeUserRole(req.user.role))) {
      return res.status(403).json({ message: "Access Denied" });
    }

    return next();
  };
}
