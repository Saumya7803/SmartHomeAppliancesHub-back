import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";

const defaultClientOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

const configuredOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
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

const configuredSeedUsers = parseBooleanEnv(process.env.SEED_DEFAULT_USERS);

if (nodeEnv === "production" && !process.env.JWT_SECRET) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

export const env = {
  nodeEnv,
  port: Number(process.env.PORT || 5000),
  clientOrigins: configuredOrigins,
  jwtSecret: process.env.JWT_SECRET || "dev_jwt_secret_change_this",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  mysql: {
    host: process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "smarthome_b2b",
  },
  seedUsers: {
    enabled: configuredSeedUsers ?? nodeEnv !== "production",
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
