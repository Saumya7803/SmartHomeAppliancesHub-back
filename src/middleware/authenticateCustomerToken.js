import { verifyToken } from "../utils/jwt.js";

export function authenticateCustomerToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token);

    if (payload.actorType !== "customer") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.customer = {
      id: Number(payload.sub),
      name: payload.name,
      email: payload.email,
      accountType: payload.accountType || "customer",
    };

    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
