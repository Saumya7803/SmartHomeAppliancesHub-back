import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { normalizeUserRole } from "./roles.js";

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      actorType: "admin",
      role: normalizeUserRole(user.role),
      name: user.name,
      email: user.email,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export function signCustomerToken(customer) {
  return jwt.sign(
    {
      sub: customer.id,
      actorType: "customer",
      role: "customer",
      accountType: customer.account_type || "customer",
      name: customer.name,
      email: customer.email,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}
