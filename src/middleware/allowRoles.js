import { requireRole } from "./requireRole.js";

function normalizeRoleInput(role) {
  return String(role || "")
    .trim()
    .toLowerCase();
}

export function allowRoles(roles = []) {
  return requireRole(roles.map(normalizeRoleInput));
}
