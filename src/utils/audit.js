import { dbPool } from "../config/db.js";

export async function logAudit({
  userId = null,
  action,
  entityType,
  entityId = null,
  details = null,
  connection = null,
}) {
  const executor = connection || dbPool;

  await executor.execute(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
     VALUES (?, ?, ?, ?, ?)` ,
    [userId, action, entityType, entityId, details ? JSON.stringify(details) : null]
  );
}

export async function logAuditSafely(payload) {
  try {
    await logAudit(payload);
  } catch {
    return null;
  }

  return true;
}
