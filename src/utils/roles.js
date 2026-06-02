export const USER_ROLES = Object.freeze({
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  DEVELOPMENT_TEAM: "development_team",
  OPERATOR: "operator",
  SALES: "sales",
});

export const USER_ROLE_VALUES = Object.freeze(Object.values(USER_ROLES));

const LEGACY_ROLE_MAP = Object.freeze({
  super_admin: USER_ROLES.SUPER_ADMIN,
  admin: USER_ROLES.ADMIN,
  development_team: USER_ROLES.DEVELOPMENT_TEAM,
  development_admin: USER_ROLES.DEVELOPMENT_TEAM,
  operator: USER_ROLES.OPERATOR,
  sales: USER_ROLES.SALES,
  sales_team: USER_ROLES.SALES,
  user: USER_ROLES.OPERATOR,
});

export function normalizeUserRole(role) {
  const normalizedRole = String(role || "").trim().toLowerCase();
  return LEGACY_ROLE_MAP[normalizedRole] || USER_ROLES.OPERATOR;
}

export function isSuperAdminRole(role) {
  return normalizeUserRole(role) === USER_ROLES.SUPER_ADMIN;
}

export function isAdminRole(role) {
  return [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(normalizeUserRole(role));
}

export function isDevelopmentTeamRole(role) {
  return normalizeUserRole(role) === USER_ROLES.DEVELOPMENT_TEAM;
}

export function isOperatorRole(role) {
  return normalizeUserRole(role) === USER_ROLES.OPERATOR;
}

export function isSalesRole(role) {
  return normalizeUserRole(role) === USER_ROLES.SALES;
}

export function canAccessAdminWorkspace(role) {
  return [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.DEVELOPMENT_TEAM, USER_ROLES.SALES].includes(
    normalizeUserRole(role)
  );
}

export function canUseDevelopmentTools(role) {
  return [USER_ROLES.SUPER_ADMIN, USER_ROLES.DEVELOPMENT_TEAM].includes(normalizeUserRole(role));
}
