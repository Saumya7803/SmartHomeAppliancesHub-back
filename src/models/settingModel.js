import { dbPool } from "../config/db.js";

function serializeValue(value) {
  return JSON.stringify(value);
}

function deserializeValue(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export async function getSettings(keys) {
  const placeholders = keys.map(() => "?").join(", ");
  const [rows] = await dbPool.execute(
    `SELECT setting_key, setting_value, updated_at
     FROM system_settings
     WHERE setting_key IN (${placeholders})`,
    keys
  );

  return rows.reduce((accumulator, row) => {
    accumulator[row.setting_key] = {
      value: deserializeValue(row.setting_value),
      updated_at: row.updated_at,
    };
    return accumulator;
  }, {});
}

export async function upsertSettings(entries, updatedBy = null) {
  for (const [settingKey, settingValue] of Object.entries(entries)) {
    await dbPool.execute(
      `INSERT INTO system_settings (setting_key, setting_value, updated_by)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         setting_value = VALUES(setting_value),
         updated_by = VALUES(updated_by),
         updated_at = CURRENT_TIMESTAMP`,
      [settingKey, serializeValue(settingValue), updatedBy]
    );
  }
}
