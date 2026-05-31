import { dbPool } from "../config/db.js";

function buildSearchClause(search) {
  if (!search) {
    return { clause: "", params: [] };
  }

  const value = `%${search.trim()}%`;
  return {
    clause: `WHERE (
      o.order_number LIKE ?
      OR c.name LIKE ?
      OR c.email LIKE ?
      OR COALESCE(c.company, '') LIKE ?
    )`,
    params: [value, value, value, value],
  };
}

export async function listOrders({ search = "", status = "" } = {}) {
  const searchFilter = buildSearchClause(search);
  const filters = [];
  const params = [...searchFilter.params];

  if (searchFilter.clause) {
    filters.push(searchFilter.clause.replace(/^WHERE /, ""));
  }

  if (status) {
    filters.push("o.status = ?");
    params.push(status);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const [rows] = await dbPool.execute(
    `SELECT
       o.*,
       c.name AS customer_name,
       c.email AS customer_email,
       c.phone AS customer_phone,
       c.company AS customer_company
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     ${whereClause}
     ORDER BY o.created_at DESC
     LIMIT 250`,
    params
  );

  return rows;
}

export async function createOrder(payload) {
  const [result] = await dbPool.execute(
    `INSERT INTO orders (customer_id, order_number, total_amount, status, support_status)
     VALUES (?, ?, ?, ?, ?)`,
    [
      payload.customer_id,
      payload.order_number,
      payload.total_amount,
      payload.status || "pending",
      payload.support_status || "open",
    ]
  );

  return result;
}

export async function updateOrderById(orderId, updates) {
  const assignments = [];
  const params = [];

  if (updates.status) {
    assignments.push("status = ?");
    params.push(updates.status);
  }

  if (updates.support_status) {
    assignments.push("support_status = ?");
    params.push(updates.support_status);
  }

  if (!assignments.length) {
    return { affectedRows: 0 };
  }

  params.push(orderId);
  const [result] = await dbPool.execute(
    `UPDATE orders SET ${assignments.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    params
  );

  return result;
}

export async function getBusinessDashboardMetrics() {
  const [[orders]] = await dbPool.execute(`SELECT COUNT(*) AS count FROM orders`);
  const [[revenue]] = await dbPool.execute(`SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders`);
  const [[products]] = await dbPool.execute(`SELECT COUNT(*) AS count FROM products`);
  const [[users]] = await dbPool.execute(`SELECT COUNT(*) AS count FROM users`);
  const [statusBreakdown] = await dbPool.execute(
    `SELECT status, COUNT(*) AS total
     FROM orders
     GROUP BY status
     ORDER BY status ASC`
  );
  const [revenueTrend] = await dbPool.execute(
    `SELECT
       DATE_FORMAT(created_at, '%b %d') AS label,
       ROUND(SUM(total_amount), 2) AS revenue,
       COUNT(*) AS orders
     FROM orders
     WHERE created_at >= (CURRENT_DATE - INTERVAL 6 DAY)
     GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%b %d')
     ORDER BY DATE(created_at) ASC`
  );

  return {
    totalOrders: orders.count,
    totalRevenue: Number(revenue.total || 0),
    totalProducts: products.count,
    totalUsers: users.count,
    orderStatusBreakdown: statusBreakdown,
    revenueTrend,
  };
}

export async function getOperatorDashboardMetrics() {
  const [[orders]] = await dbPool.execute(`SELECT COUNT(*) AS count FROM orders`);
  const [[openSupport]] = await dbPool.execute(
    `SELECT COUNT(*) AS count FROM orders WHERE support_status IN ('open', 'in_progress')`
  );
  const [[resolved]] = await dbPool.execute(
    `SELECT COUNT(*) AS count FROM orders WHERE support_status = 'resolved'`
  );
  const [[customers]] = await dbPool.execute(`SELECT COUNT(*) AS count FROM customers`);
  const [supportBreakdown] = await dbPool.execute(
    `SELECT support_status, COUNT(*) AS total
     FROM orders
     GROUP BY support_status
     ORDER BY support_status ASC`
  );

  return {
    totalOrders: orders.count,
    openSupportTickets: openSupport.count,
    resolvedTickets: resolved.count,
    activeCustomers: customers.count,
    supportBreakdown,
  };
}
