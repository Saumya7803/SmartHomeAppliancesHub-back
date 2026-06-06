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

function mapQuotationRow(row) {
  return {
    ...row,
    id: Number(row.id || 0),
    enquiry_id: Number(row.enquiry_id || 0),
    product_id: row.product_id ? Number(row.product_id) : null,
    quantity: Number(row.quantity || 0),
    unit_price: Number(row.unit_price || 0),
    discount_percent: Number(row.discount_percent || 0),
    subtotal_amount: Number(row.subtotal_amount || 0),
    discount_amount: Number(row.discount_amount || 0),
    total_amount: Number(row.total_amount || 0),
    created_by: row.created_by ? Number(row.created_by) : null,
    approved_by: row.approved_by ? Number(row.approved_by) : null,
    sent_by: row.sent_by ? Number(row.sent_by) : null,
    assigned_to: row.assigned_to ? Number(row.assigned_to) : null,
  };
}

function buildQuotationFilters({
  search = "",
  status = "",
  actorRole = "operator",
  actorId = null,
}) {
  const filters = [];
  const params = [];

  const normalizedSearch = String(search || "").trim();
  if (normalizedSearch) {
    const value = `%${normalizedSearch}%`;
    filters.push(
      `(q.quotation_number LIKE ? OR q.customer_name LIKE ? OR q.customer_email LIKE ? OR q.product_name LIKE ? OR CONCAT('ENQ-', LPAD(e.id, 6, '0')) LIKE ?)`
    );
    params.push(value, value, value, value, value);
  }

  const normalizedStatus = String(status || "").trim().toLowerCase();
  if (normalizedStatus) {
    filters.push("q.quotation_status = ?");
    params.push(normalizedStatus);
  }

  const normalizedRole = normalizeUserRole(actorRole);
  const numericActorId = Number(actorId);
  if (normalizedRole === "sales" && Number.isFinite(numericActorId) && numericActorId > 0) {
    filters.push("(q.created_by = ? OR e.assigned_to = ?)");
    params.push(numericActorId, numericActorId);
  }

  return {
    clause: filters.length ? `WHERE ${filters.join(" AND ")}` : "",
    params,
  };
}

export async function listQuotations({
  search = "",
  status = "",
  page = 1,
  pageSize = 10,
  actorRole = "operator",
  actorId = null,
} = {}) {
  const paging = normalizePagination(page, pageSize);
  const filters = buildQuotationFilters({
    search,
    status,
    actorRole,
    actorId,
  });

  const [[countRow]] = await dbPool.query(
    `SELECT COUNT(*) AS total
     FROM quotations q
     JOIN enquiries e ON e.id = q.enquiry_id
     ${filters.clause}`,
    filters.params
  );

  const [rows] = await dbPool.query(
    `SELECT
       q.*,
       CONCAT('ENQ-', LPAD(e.id, 6, '0')) AS enquiry_code,
       e.status AS enquiry_status,
       e.assigned_to,
       uc.name AS created_by_name,
       ua.name AS approved_by_name,
       us.name AS sent_by_name,
       ua2.name AS assigned_to_name
     FROM quotations q
     JOIN enquiries e ON e.id = q.enquiry_id
     LEFT JOIN users uc ON uc.id = q.created_by
     LEFT JOIN users ua ON ua.id = q.approved_by
     LEFT JOIN users us ON us.id = q.sent_by
     LEFT JOIN users ua2 ON ua2.id = e.assigned_to
     ${filters.clause}
     ORDER BY q.created_at DESC
     LIMIT ? OFFSET ?`,
    [...filters.params, paging.pageSize, paging.offset]
  );

  return {
    rows: rows.map(mapQuotationRow),
    total: Number(countRow.total || 0),
    page: paging.page,
    pageSize: paging.pageSize,
  };
}

export async function findQuotationById(quotationId) {
  const [rows] = await dbPool.execute(
    `SELECT
       q.*,
       CONCAT('ENQ-', LPAD(e.id, 6, '0')) AS enquiry_code,
       e.status AS enquiry_status,
       e.assigned_to,
       e.product_name AS enquiry_product_name,
       e.quantity AS enquiry_quantity,
       uc.name AS created_by_name,
       ua.name AS approved_by_name,
       us.name AS sent_by_name,
       ua2.name AS assigned_to_name
     FROM quotations q
     JOIN enquiries e ON e.id = q.enquiry_id
     LEFT JOIN users uc ON uc.id = q.created_by
     LEFT JOIN users ua ON ua.id = q.approved_by
     LEFT JOIN users us ON us.id = q.sent_by
     LEFT JOIN users ua2 ON ua2.id = e.assigned_to
     WHERE q.id = ?
     LIMIT 1`,
    [quotationId]
  );

  return rows.length ? mapQuotationRow(rows[0]) : null;
}

export async function createQuotation(payload) {
  const [result] = await dbPool.execute(
    `INSERT INTO quotations
       (
         enquiry_id,
         quotation_number,
         quotation_status,
         customer_name,
         customer_email,
         customer_phone,
         product_id,
         product_name,
         unit_price,
         quantity,
         discount_percent,
         subtotal_amount,
         discount_amount,
         total_amount,
         valid_until,
         notes,
         created_by,
         approved_by,
         approved_at
       )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.enquiry_id,
      payload.quotation_number || null,
      payload.quotation_status || "pending_approval",
      payload.customer_name,
      payload.customer_email,
      payload.customer_phone,
      payload.product_id || null,
      payload.product_name,
      payload.unit_price,
      payload.quantity,
      payload.discount_percent,
      payload.subtotal_amount,
      payload.discount_amount,
      payload.total_amount,
      payload.valid_until,
      payload.notes || null,
      payload.created_by || null,
      payload.approved_by || null,
      payload.approved_at || null,
    ]
  );

  const quotationId = Number(result.insertId);
  if (!payload.quotation_number) {
    const quotationNumber = `QTN-${String(quotationId).padStart(6, "0")}`;
    await dbPool.execute(`UPDATE quotations SET quotation_number = ? WHERE id = ?`, [
      quotationNumber,
      quotationId,
    ]);
  }

  return {
    insertId: quotationId,
  };
}

export async function updateQuotationById(quotationId, updates = {}) {
  const assignments = [];
  const params = [];

  if (updates.quotation_status) {
    assignments.push("quotation_status = ?");
    params.push(String(updates.quotation_status).trim().toLowerCase());
  }

  if (updates.approved_by !== undefined) {
    assignments.push("approved_by = ?");
    params.push(updates.approved_by ? Number(updates.approved_by) : null);
  }

  if (updates.approved_at !== undefined) {
    assignments.push("approved_at = ?");
    params.push(updates.approved_at || null);
  }

  if (updates.sent_by !== undefined) {
    assignments.push("sent_by = ?");
    params.push(updates.sent_by ? Number(updates.sent_by) : null);
  }

  if (updates.sent_at !== undefined) {
    assignments.push("sent_at = ?");
    params.push(updates.sent_at || null);
  }

  if (updates.email_subject !== undefined) {
    assignments.push("email_subject = ?");
    params.push(updates.email_subject || null);
  }

  if (updates.email_body !== undefined) {
    assignments.push("email_body = ?");
    params.push(updates.email_body || null);
  }

  if (updates.valid_until !== undefined) {
    assignments.push("valid_until = ?");
    params.push(updates.valid_until || null);
  }

  if (updates.notes !== undefined) {
    assignments.push("notes = ?");
    params.push(updates.notes || null);
  }

  if (!assignments.length) {
    return { affectedRows: 0 };
  }

  params.push(quotationId);
  const [result] = await dbPool.execute(
    `UPDATE quotations
     SET ${assignments.join(", ")}, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    params
  );

  return result;
}
