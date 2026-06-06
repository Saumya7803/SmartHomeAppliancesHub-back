import mysql from "mysql2/promise";
import { env } from "./env.js";

const baseConfig = {
  host: env.mysql.host,
  port: env.mysql.port,
  user: env.mysql.user,
  password: env.mysql.password,
  connectTimeout: 10_000,
  ...(env.mysql.ssl.enabled
    ? {
        ssl: {
          rejectUnauthorized: env.mysql.ssl.rejectUnauthorized,
          ...(env.mysql.ssl.ca ? { ca: env.mysql.ssl.ca } : {}),
        },
      }
    : {}),
};

export const dbPool = mysql.createPool({
  ...baseConfig,
  database: env.mysql.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

function sanitizeIdentifier(value) {
  return String(value || "").replace(/`/g, "");
}

export async function ensureDatabaseExists() {
  if (!env.mysql.createDatabase) {
    return;
  }

  const connection = await mysql.createConnection(baseConfig);

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${sanitizeIdentifier(
        env.mysql.database
      )}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await connection.end();
  }
}

export async function testConnection() {
  const connection = await dbPool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

export function isDatabaseConnectionError(error) {
  const dbConnectionErrorCodes = new Set([
    "ECONNREFUSED",
    "PROTOCOL_CONNECTION_LOST",
    "ER_ACCESS_DENIED_ERROR",
    "ER_BAD_DB_ERROR",
    "ETIMEDOUT",
    "ENOTFOUND",
  ]);

  if (error?.code && dbConnectionErrorCodes.has(error.code)) {
    return true;
  }

  if (Array.isArray(error?.errors)) {
    return error.errors.some(
      (innerError) => innerError?.code && dbConnectionErrorCodes.has(innerError.code)
    );
  }

  return false;
}
