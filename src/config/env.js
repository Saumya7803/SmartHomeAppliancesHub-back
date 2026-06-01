import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const isRender = process.env.RENDER === "true" || Boolean(process.env.RENDER_SERVICE_ID);
const isHostedPort = Boolean(process.env.PORT) && process.env.PORT !== "5000";
const isProductionLike = nodeEnv === "production" || isRender || isHostedPort;

const defaultClientOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "https://smarthomeapplianceshub-frontend.onrender.com",
];

const configuredOrigins = process.env.CLIENT_ORIGIN
  ? [
      ...new Set([
        ...defaultClientOrigins,
        ...process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean),
      ]),
    ]
  : defaultClientOrigins;

function parseBooleanEnv(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return null;
}

function parseMySqlUrl(value) {
  if (!value) {
    return {};
  }

  const parsed = new URL(value);
  const database = parsed.pathname.replace(/^\/+/, "");
  const sslParam = parsed.searchParams.get("ssl") || parsed.searchParams.get("ssl-mode");

  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : undefined,
    user: decodeURIComponent(parsed.username || ""),
    password: decodeURIComponent(parsed.password || ""),
    database: database ? decodeURIComponent(database) : undefined,
    ssl:
      sslParam && !["0", "false", "disable", "disabled"].includes(sslParam.toLowerCase()),
  };
}

function getRequiredEnv(name) {
  const value = process.env[name];

  if (isProductionLike && !value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function isLocalMySqlHost(value) {
  return ["localhost", "127.0.0.1", "::1"].includes(String(value || "").trim().toLowerCase());
}

const mysqlUrlConfig = parseMySqlUrl(process.env.MYSQL_URL || process.env.DATABASE_URL);
const configuredSeedUsers = parseBooleanEnv(process.env.SEED_DEFAULT_USERS);
const configuredMySqlSsl = parseBooleanEnv(process.env.MYSQL_SSL);
const configuredCreateDatabase = parseBooleanEnv(process.env.MYSQL_CREATE_DATABASE);
const mysqlHost = mysqlUrlConfig.host || process.env.MYSQL_HOST || getRequiredEnv("MYSQL_HOST") || "localhost";
const mysqlPort = Number(mysqlUrlConfig.port || process.env.MYSQL_PORT || 3306);
const mysqlUser = mysqlUrlConfig.user || process.env.MYSQL_USER || getRequiredEnv("MYSQL_USER") || "root";
const mysqlPassword = mysqlUrlConfig.password || process.env.MYSQL_PASSWORD || "";
const mysqlDatabase =
  mysqlUrlConfig.database ||
  process.env.MYSQL_DATABASE ||
  getRequiredEnv("MYSQL_DATABASE") ||
  "smarthome_b2b";

if (isProductionLike && !process.env.JWT_SECRET) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

if (isProductionLike && isLocalMySqlHost(mysqlHost)) {
  throw new Error("MYSQL_HOST cannot be localhost on Render. Set MYSQL_URL to your Railway public MySQL URL.");
}

export const env = {
  nodeEnv,
  port: Number(process.env.PORT || 5000),
  clientOrigins: configuredOrigins,
  jwtSecret: process.env.JWT_SECRET || "dev_jwt_secret_change_this",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  mysql: {
    host: mysqlHost,
    port: mysqlPort,
    user: mysqlUser,
    password: mysqlPassword,
    database: mysqlDatabase,
    ssl: {
      enabled: configuredMySqlSsl ?? mysqlUrlConfig.ssl ?? false,
      rejectUnauthorized: parseBooleanEnv(process.env.MYSQL_SSL_REJECT_UNAUTHORIZED) ?? true,
      ca: process.env.MYSQL_SSL_CA ? process.env.MYSQL_SSL_CA.replace(/\\n/g, "\n") : "",
    },
    createDatabase: configuredCreateDatabase ?? !isProductionLike,
  },
  seedUsers: {
    enabled: configuredSeedUsers ?? !isProductionLike,
    superAdmin: {
      name: process.env.DEFAULT_SUPER_ADMIN_NAME || "Super Admin",
      email: process.env.DEFAULT_SUPER_ADMIN_EMAIL || "admin@smarthome.com",
      password: process.env.DEFAULT_SUPER_ADMIN_PASSWORD || "Admin@123",
    },
    admin: {
      name: process.env.DEFAULT_ADMIN_NAME || "Admin Manager",
      email: process.env.DEFAULT_ADMIN_EMAIL || "manager@smarthome.com",
      password: process.env.DEFAULT_ADMIN_PASSWORD || "Manager@123",
    },
    developmentTeam: {
      name:
        process.env.DEFAULT_DEVELOPMENT_TEAM_NAME ||
        process.env.DEFAULT_DEVELOPMENT_ADMIN_NAME ||
        "Development Team",
      email:
        process.env.DEFAULT_DEVELOPMENT_TEAM_EMAIL ||
        process.env.DEFAULT_DEVELOPMENT_ADMIN_EMAIL ||
        "dev@smarthome.com",
      password:
        process.env.DEFAULT_DEVELOPMENT_TEAM_PASSWORD ||
        process.env.DEFAULT_DEVELOPMENT_ADMIN_PASSWORD ||
        "Dev@123",
    },
    operator: {
      name:
        process.env.DEFAULT_OPERATOR_NAME ||
        process.env.DEFAULT_USER_NAME ||
        "Operator",
      email:
        process.env.DEFAULT_OPERATOR_EMAIL ||
        process.env.DEFAULT_USER_EMAIL ||
        "operator@smarthome.com",
      password:
        process.env.DEFAULT_OPERATOR_PASSWORD ||
        process.env.DEFAULT_USER_PASSWORD ||
        "Operator@123",
    },
    sales: {
      name: process.env.DEFAULT_SALES_NAME || "Sales Team",
      email: process.env.DEFAULT_SALES_EMAIL || "sales@smarthomeappliances.co",
      password: process.env.DEFAULT_SALES_PASSWORD || "Sales@123",
    },
  },
  mail: {
    fromName: process.env.MAIL_FROM_NAME || "SmartHome Sales",
    fromEmail: process.env.MAIL_FROM_EMAIL || "sales@smarthomeappliances.co",
    replyTo: process.env.MAIL_REPLY_TO || "",
    smtpHost: process.env.SMTP_HOST || "",
    smtpPort: Number(process.env.SMTP_PORT || 587),
    smtpSecure: parseBooleanEnv(process.env.SMTP_SECURE) ?? false,
    smtpUser: process.env.SMTP_USER || "",
    smtpPass: process.env.SMTP_PASS || "",
  },
};
