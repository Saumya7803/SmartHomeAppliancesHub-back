import { dbPool } from "../config/db.js";

function buildInvoiceSearchClause(search) {
  if (!search) {
    return { clause: "", params: [] };
  }

  const value = `%${String(search).trim()}%`;
  return {
    clause: `WHERE (
      i.invoice_number LIKE ?
      OR c.name LIKE ?
      OR c.email LIKE ?
      OR COALESCE(o.order_number, '') LIKE ?
    )`,
    params: [value, value, value, value],
  };
}

export async function listInvoices({ search = "", status = "" } = {}) {
  const searchFilter = buildInvoiceSearchClause(search);
  const filters = [];
  const params = [...searchFilter.params];

  if (searchFilter.clause) {
    filters.push(searchFilter.clause.replace(/^WHERE /, ""));
  }

  if (status) {
    filters.push("i.status = ?");
    params.push(status);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const [rows] = await dbPool.execute(
    `SELECT
       i.*,
       c.name AS customer_name,
       c.email AS customer_email,
       o.order_number
     FROM invoices i
     JOIN customers c ON c.id = i.customer_id
     LEFT JOIN orders o ON o.id = i.order_id
     ${whereClause}
     ORDER BY i.issued_at DESC, i.created_at DESC
     LIMIT 250`,
    params
  );

  return rows;
}

export async function createInvoice(payload) {
  const [result] = await dbPool.execute(
    `INSERT INTO invoices
       (invoice_number, customer_id, order_id, total_amount, status, issued_at, due_date, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.invoice_number,
      payload.customer_id,
      payload.order_id || null,
      payload.total_amount,
      payload.status || "issued",
      payload.issued_at || new Date(),
      payload.due_date || null,
      payload.created_by || null,
    ]
  );

  return result;
}
