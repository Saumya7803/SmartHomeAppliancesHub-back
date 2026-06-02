import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dbPool } from "../config/db.js";
import { env } from "../config/env.js";
import { logAudit } from "../utils/audit.js";
import { parseJson } from "../utils/serializers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../../..");
const LOG_FILES = Object.freeze([
  "backend-dev.log",
  "backend-dev.err",
  "frontend-dev.log",
  "frontend-dev.err",
]);
const READ_ONLY_QUERY_PATTERN = /^\s*(select|show|describe|desc|explain)\b/i;
const FORBIDDEN_QUERY_PATTERN =
  /\b(insert|update|delete|drop|alter|create|truncate|replace|grant|revoke|call)\b/i;

const runtimeCacheState = {
  lastClearedAt: null,
  clearedBy: null,
};

function tailLines(content, limit = 80) {
  return String(content || "")
    .split(/\r?\n/)
    .slice(-limit)
    .join("\n");
}

function mapAuditRows(rows) {
  return rows.map((row) => ({
    ...row,
    details: parseJson(row.details, {}),
  }));
}

async function loadAuditRows(whereClause = "1=1", params = [], limit = 200) {
  const [rows] = await dbPool.execute(
    `SELECT l.*, u.name AS user_name, u.email AS user_email
     FROM audit_logs l
     LEFT JOIN users u ON u.id = l.user_id
     WHERE ${whereClause}
     ORDER BY l.created_at DESC
     LIMIT ?`,
    [...params, limit]
  );

  return mapAuditRows(rows);
}

async function readBuildLogFile(fileName) {
  const filePath = path.join(PROJECT_ROOT, fileName);

  try {
    const content = await fs.readFile(filePath, "utf8");
    return {
      fileName,
      exists: true,
      content: tailLines(content),
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        fileName,
        exists: false,
        content: "",
      };
    }

    throw error;
  }
}

async function assertValidTable(tableName) {
  const [rows] = await dbPool.execute(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = ? AND table_name = ?
     LIMIT 1`,
    [env.mysql.database, tableName]
  );

  if (!rows.length) {
    const error = new Error("Table not found");
    error.statusCode = 404;
    throw error;
  }
}

export async function getTechnicalDashboard(req, res, next) {
  try {
    await dbPool.execute("SELECT 1");

    const [[productCount]] = await dbPool.execute(`SELECT COUNT(*) AS count FROM products`);
    const [[userCount]] = await dbPool.execute(`SELECT COUNT(*) AS count FROM users`);
    const [[requestCount]] = await dbPool.execute(
      `SELECT COUNT(*) AS count
       FROM audit_logs
       WHERE action = 'api_request' AND created_at >= (NOW() - INTERVAL 24 HOUR)`
    );
    const [[errorCount]] = await dbPool.execute(
      `SELECT COUNT(*) AS count
       FROM audit_logs
       WHERE action = 'api_error' AND created_at >= (NOW() - INTERVAL 24 HOUR)`
    );
    const [[enabledFlagCount]] = await dbPool.execute(
      `SELECT COUNT(*) AS count FROM feature_flags WHERE is_enabled = 1`
    );

    return res.json({
      systemHealth: {
        status: "healthy",
        database: "connected",
        environment: env.nodeEnv,
        timestamp: new Date().toISOString(),
      },
      performance: {
        uptimeSeconds: Math.round(process.uptime()),
        rssMb: Number((process.memoryUsage().rss / (1024 * 1024)).toFixed(2)),
        heapUsedMb: Number((process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2)),
        nodeVersion: process.version,
      },
      counters: {
        apiRequests24h: requestCount.count,
        errorLogs24h: errorCount.count,
        enabledFeatureFlags: enabledFlagCount.count,
        totalProducts: productCount.count,
        totalUsers: userCount.count,
      },
      cache: runtimeCacheState,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getApiRequestLogs(req, res, next) {
  try {
    const logs = await loadAuditRows(`l.action = 'api_request'`);
    return res.json({ logs });
  } catch (error) {
    return next(error);
  }
}

export async function getSystemLogs(req, res, next) {
  try {
    const errorLogs = await loadAuditRows(`l.action = 'api_error'`, [], 150);
    const auditLogs = await loadAuditRows(`l.action NOT IN ('api_request', 'api_error')`, [], 150);

    return res.json({
      errorLogs,
      auditLogs,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getBuildLogs(req, res, next) {
  try {
    const files = await Promise.all(LOG_FILES.map((fileName) => readBuildLogFile(fileName)));
    return res.json({ files });
  } catch (error) {
    return next(error);
  }
}

export async function clearCache(req, res, next) {
  try {
    runtimeCacheState.lastClearedAt = new Date().toISOString();
    runtimeCacheState.clearedBy = req.user.email;

    await logAudit({
      userId: req.user.id,
      action: "clear_cache",
      entityType: "system",
      details: runtimeCacheState,
    });

    return res.json({
      message: "Runtime cache cleared",
      cache: runtimeCacheState,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getFeatureFlags(req, res, next) {
  try {
    const [rows] = await dbPool.execute(
      `SELECT id, flag_key, label, description, is_enabled, updated_by, updated_at
       FROM feature_flags
       ORDER BY flag_key ASC`
    );

    return res.json({
      flags: rows.map((row) => ({
        ...row,
        is_enabled: Boolean(row.is_enabled),
      })),
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateFeatureFlag(req, res, next) {
  try {
    const { flagKey } = req.params;
    const enabled = Boolean(req.body.enabled);

    const [result] = await dbPool.execute(
      `UPDATE feature_flags
       SET is_enabled = ?, updated_by = ?
       WHERE flag_key = ?`,
      [Number(enabled), req.user.id, flagKey]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Feature flag not found" });
    }

    await logAudit({
      userId: req.user.id,
      action: "update_feature_flag",
      entityType: "feature_flag",
      details: { flagKey, enabled },
    });

    return res.json({
      message: "Feature flag updated",
      flagKey,
      enabled,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getDatabaseTables(req, res, next) {
  try {
    const [rows] = await dbPool.execute(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = ?
       ORDER BY table_name ASC`,
      [env.mysql.database]
    );

    return res.json({
      tables: rows.map((row) => row.table_name),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getDatabaseTableRows(req, res, next) {
  try {
    const { tableName } = req.params;
    const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100);

    await assertValidTable(tableName);

    const [rows] = await dbPool.query("SELECT * FROM ?? LIMIT ?", [tableName, limit]);

    return res.json({
      tableName,
      limit,
      rows,
    });
  } catch (error) {
    return next(error);
  }
}

export async function runReadOnlyQuery(req, res, next) {
  try {
    const sql = String(req.body.sql || "").trim();

    if (!sql) {
      return res.status(400).json({ message: "SQL query is required" });
    }

    if (!READ_ONLY_QUERY_PATTERN.test(sql) || FORBIDDEN_QUERY_PATTERN.test(sql)) {
      return res.status(403).json({ message: "Only read-only SQL queries are allowed" });
    }

    const [rows, fields] = await dbPool.query(sql);

    return res.json({
      rows: Array.isArray(rows) ? rows.slice(0, 200) : rows,
      fields: Array.isArray(fields) ? fields.map((field) => field.name) : [],
      truncated: Array.isArray(rows) && rows.length > 200,
    });
  } catch (error) {
    return next(error);
  }
}
