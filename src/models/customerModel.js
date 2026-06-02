import { dbPool } from "../config/db.js";

export async function listCustomers({ search = "" } = {}) {
  const hasSearch = Boolean(String(search || "").trim());
  const value = `%${String(search || "").trim()}%`;
  const [rows] = await dbPool.execute(
    `SELECT
       c.*,
       COUNT(o.id) AS order_count,
       COALESCE(SUM(o.total_amount), 0) AS lifetime_value,
       MAX(o.created_at) AS last_order_at
     FROM customers c
     LEFT JOIN orders o ON o.customer_id = c.id
     ${hasSearch ? "WHERE c.name LIKE ? OR c.email LIKE ? OR COALESCE(c.company, '') LIKE ?" : ""}
     GROUP BY c.id, c.name, c.email, c.phone, c.company, c.status, c.created_at, c.updated_at
     ORDER BY c.created_at DESC
     LIMIT 250`,
    hasSearch ? [value, value, value] : []
  );

  return rows;
}

export async function createCustomer(payload) {
  const [result] = await dbPool.execute(
    `INSERT INTO customers (name, email, phone, company, status)
     VALUES (?, ?, ?, ?, ?)`,
    [payload.name, payload.email, payload.phone || null, payload.company || null, payload.status || "active"]
  );

  return result;
}

export async function findCustomerById(customerId) {
  const [rows] = await dbPool.execute(
    `SELECT id, name, email, phone, company, status
     FROM customers
     WHERE id = ?
     LIMIT 1`,
    [customerId]
  );

  return rows[0] || null;
}

export async function updateCustomerById(customerId, payload) {
  const [result] = await dbPool.execute(
    `UPDATE customers
     SET name = ?,
         email = ?,
         phone = ?,
         company = ?,
         status = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      payload.name,
      payload.email,
      payload.phone || null,
      payload.company || null,
      payload.status || "active",
      customerId,
    ]
  );

  return result;
}
