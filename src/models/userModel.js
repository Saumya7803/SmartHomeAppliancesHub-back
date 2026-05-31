import { dbPool } from "../config/db.js";

export async function findUserByEmail(email) {
  const [rows] = await dbPool.execute(
    `SELECT id, name, email, password, role, status FROM users WHERE email = ? LIMIT 1`,
    [email]
  );

  return rows[0] || null;
}

export async function findUserById(userId) {
  const [rows] = await dbPool.execute(
    `SELECT id, name, email, role, status, created_at, updated_at FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

export async function listUsersWithActivity() {
  const [rows] = await dbPool.execute(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.role,
       u.status,
       u.created_at,
       u.updated_at,
       MAX(l.created_at) AS last_activity_at,
       COUNT(l.id) AS activity_count
     FROM users u
     LEFT JOIN audit_logs l ON l.user_id = u.id
     GROUP BY u.id, u.name, u.email, u.role, u.status, u.created_at, u.updated_at
     ORDER BY u.created_at DESC`
  );

  return rows;
}
