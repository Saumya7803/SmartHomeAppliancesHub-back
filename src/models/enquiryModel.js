import { dbPool } from "../config/db.js";
import { normalizeUserRole } from "../utils/roles.js";

function normalizePagination(page, pageSize) {
  const normalizedPage = Math.max(1, Number(page) || 1);
  const normalizedPageSize = Math.min(100, Math.max(1, Number(pageSize) || 10));
  return {
    page: normalizedPage,
    pageSize: normalizedPageSize,
    offset: (normalizedPage - 1) * normalizedPageSize,
  };
}

function mapEnquiryRow(row) {
  const enquiryId = Number(row.id || 0);
  return {
    ...row,
    id: enquiryId,
    enquiry_code:
      row.enquiry_code ||
      row.generated_enquiry_code ||
      (enquiryId > 0 ? `ENQ-${String(enquiryId).padStart(6, "0")}` : null),
    product_id: row.product_id ? Number(row.product_id) : null,
    quantity: Number(row.quantity || 0),
    assigned_to: row.assigned_to ? Number(row.assigned_to) : null,
    quotation_id: row.quotation_id ? Number(row.quotation_id) : null,
  };
}

function buildEnquiryFilters({
  search = "",
  status = "",
  actorRole = "operator",
  actorId = null,
  mineOnly = false,
}) {
  const filters = [];
  const params = [];

  const normalizedSearch = String(search || "").trim();
  if (normalizedSearch) {
    const value = `%${normalizedSearch}%`;
    filters.push(
      `(CONCAT('ENQ-', LPAD(e.id, 6, '0')) LIKE ? OR e.customer_name LIKE ? OR e.email LIKE ? OR e.phone LIKE ? OR e.product_name LIKE ? OR COALESCE(e.message, '') LIKE ?)`
    );
    params.push(value, value, value, value, value, value);
  }

  const normalizedStatus = String(status || "").trim().toLowerCase();
  if (normalizedStatus) {
    filters.push("e.status = ?");
    params.push(normalizedStatus);
  }

  const normalizedRole = normalizeUserRole(actorRole);
  const numericActorId = Number(actorId);
  if (normalizedRole === "sales" && Number.isFinite(numericActorId) && numericActorId > 0) {
    if (mineOnly) {
      filters.push("e.assigned_to = ?");
      params.push(numericActorId);
    } else {
      filters.push("(e.assigned_to IS NULL OR e.assigned_to = ?)");
      params.push(numericActorId);
    }
  }

  return {
    clause: filters.length ? `WHERE ${filters.join(" AND ")}` : "",
    params,
  };
}

export async function listEnquiries({
  search = "",
  status = "",
  page = 1,
  pageSize = 10,
  actorRole = "operator",
  actorId = null,
  mineOnly = false,
} = {}) {
  const paging = normalizePagination(page, pageSize);
  const filters = buildEnquiryFilters({
    search,
    status,
    actorRole,
    actorId,
    mineOnly,
  });

  const [[countRow]] = await dbPool.query(
    `SELECT COUNT(*) AS total
     FROM enquiries e
     ${filters.clause}`,
    filters.params
  );

  const [rows] = await dbPool.query(
    `SELECT
       e.*,
       CONCAT('ENQ-', LPAD(e.id, 6, '0')) AS generated_enquiry_code,
       u.name AS assigned_to_name,
       q.id AS quotation_id,
       q.quotation_number,
       q.quotation_status
     FROM enquiries e
     LEFT JOIN users u ON u.id = e.assigned_to
     LEFT JOIN (
       SELECT qt.*
       FROM quotations qt
       INNER JOIN (
         SELECT enquiry_id, MAX(id) AS latest_id
         FROM quotations
         GROUP BY enquiry_id
       ) latest ON latest.latest_id = qt.id
     ) q ON q.enquiry_id = e.id
     ${filters.clause}
     ORDER BY e.created_at DESC
     LIMIT ? OFFSET ?`,
    [...filters.params, paging.pageSize, paging.offset]
  );

  return {
    rows: rows.map(mapEnquiryRow),
    total: Number(countRow.total || 0),
    page: paging.page,
    pageSize: paging.pageSize,
  };
}

export async function findEnquiryById(enquiryId) {
  const [rows] = await dbPool.query(
    `SELECT
       e.*,
       CONCAT('ENQ-', LPAD(e.id, 6, '0')) AS generated_enquiry_code,
       u.name AS assigned_to_name,
       q.id AS quotation_id,
       q.quotation_number,
       q.quotation_status
     FROM enquiries e
     LEFT JOIN users u ON u.id = e.assigned_to
     LEFT JOIN (
       SELECT qt.*
       FROM quotations qt
       INNER JOIN (
         SELECT enquiry_id, MAX(id) AS latest_id
         FROM quotations
         GROUP BY enquiry_id
       ) latest ON latest.latest_id = qt.id
     ) q ON q.enquiry_id = e.id
     WHERE e.id = ?
     LIMIT 1`,
    [enquiryId]
  );

  return rows.length ? mapEnquiryRow(rows[0]) : null;
}

export async function createEnquiry(payload) {
  const [result] = await dbPool.query(
    `INSERT INTO enquiries
       (customer_name, email, phone, product_id, product_name, quantity, message, status, source, assigned_to)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.customer_name,
      payload.email,
      payload.phone,
      payload.product_id || null,
      payload.product_name,
      payload.quantity,
      payload.message || null,
      payload.status || "new",
      payload.source || "website",
      payload.assigned_to || null,
    ]
  );

  const enquiryId = Number(result.insertId);
  const enquiryCode = `ENQ-${String(enquiryId).padStart(6, "0")}`;

  return {
    insertId: enquiryId,
    enquiryCode,
  };
}

export async function updateEnquiryById(enquiryId, updates = {}) {
  const assignments = [];
  const params = [];

  if (updates.status) {
    assignments.push("status = ?");
    params.push(String(updates.status).trim().toLowerCase());
  }

  if (updates.assigned_to !== undefined) {
    assignments.push("assigned_to = ?");
    params.push(updates.assigned_to ? Number(updates.assigned_to) : null);
  }

  if (updates.contacted_at) {
    assignments.push("contacted_at = ?");
    params.push(updates.contacted_at);
  }

  if (updates.quoted_at) {
    assignments.push("quoted_at = ?");
    params.push(updates.quoted_at);
  }

  if (updates.closed_at) {
    assignments.push("closed_at = ?");
    params.push(updates.closed_at);
  }

  if (!assignments.length) {
    return { affectedRows: 0 };
  }

  params.push(enquiryId);
  const [result] = await dbPool.query(
    `UPDATE enquiries
     SET ${assignments.join(", ")}, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    params
  );

  return result;
}

export async function listAssignedCustomers(userId) {
  const [rows] = await dbPool.query(
    `SELECT
       LOWER(email) AS customer_key,
       MAX(customer_name) AS customer_name,
       email,
       MAX(phone) AS phone,
       COUNT(*) AS enquiry_count,
       MAX(updated_at) AS last_activity_at
     FROM enquiries
     WHERE assigned_to = ?
     GROUP BY LOWER(email), email
     ORDER BY last_activity_at DESC`,
    [userId]
  );

  return rows.map((row) => ({
    ...row,
    enquiry_count: Number(row.enquiry_count || 0),
  }));
}
