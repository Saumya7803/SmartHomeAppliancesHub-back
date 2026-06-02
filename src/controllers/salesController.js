import { dbPool } from "../config/db.js";
import {
  createCustomer,
  findCustomerById,
  listCustomers as listCustomerRows,
  updateCustomerById,
} from "../models/customerModel.js";
import {
  createEnquiry,
  findEnquiryById,
  listAssignedCustomers,
  listEnquiries,
  updateEnquiryById,
} from "../models/enquiryModel.js";
import { createInvoice, listInvoices as listInvoiceRows } from "../models/invoiceModel.js";
import { createOrder, listOrders as listOrderRows, updateOrderById } from "../models/orderModel.js";
import {
  createQuotation,
  findQuotationById,
  listQuotations,
  updateQuotationById,
} from "../models/quotationModel.js";
import {
  buildQuotationPdfBuffer,
  sendQuotationEmail,
} from "../services/quotationService.js";
import { logAudit } from "../utils/audit.js";
import { normalizeUserRole } from "../utils/roles.js";
import { mapProductRow } from "../utils/serializers.js";

const ENQUIRY_STATUS_VALUES = Object.freeze(["new", "contacted", "quoted", "closed"]);
const QUOTATION_STATUS_VALUES = Object.freeze([
  "draft",
  "pending_approval",
  "approved",
  "sent",
  "expired",
  "rejected",
]);

function mapInvoiceRow(row) {
  return {
    ...row,
    customer_id: Number(row.customer_id || 0),
    order_id: row.order_id ? Number(row.order_id) : null,
    total_amount: Number(row.total_amount || 0),
  };
}

function normalizeCustomerPayload(body) {
  return {
    name: String(body.name || "").trim(),
    email: String(body.email || "")
      .trim()
      .toLowerCase(),
    phone: body.phone ? String(body.phone).trim() : null,
    company: body.company ? String(body.company).trim() : null,
    status: String(body.status || "active")
      .trim()
      .toLowerCase(),
  };
}

function toPositiveInt(value, fallback = 1) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
}

function toMoney(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
}

function normalizeEnquiryStatus(value, fallback = "new") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return ENQUIRY_STATUS_VALUES.includes(normalized) ? normalized : fallback;
}

function normalizeQuotationStatus(value, fallback = "pending_approval") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return QUOTATION_STATUS_VALUES.includes(normalized) ? normalized : fallback;
}

function computeQuotationAmounts({ unitPrice, quantity, discountPercent }) {
  const subtotalAmount = Number((unitPrice * quantity).toFixed(2));
  const discountAmount = Number(((subtotalAmount * discountPercent) / 100).toFixed(2));
  const totalAmount = Number((subtotalAmount - discountAmount).toFixed(2));

  return {
    subtotalAmount,
    discountAmount,
    totalAmount,
  };
}

function canAccessSalesEnquiry(user, enquiry) {
  const role = normalizeUserRole(user?.role);
  if (role !== "sales") {
    return true;
  }

  const assignedTo = enquiry?.assigned_to ? Number(enquiry.assigned_to) : null;
  if (!assignedTo) {
    return true;
  }

  return assignedTo === Number(user.id);
}

function canAccessSalesQuotation(user, quotation) {
  const role = normalizeUserRole(user?.role);
  if (role !== "sales") {
    return true;
  }

  const actorId = Number(user.id);
  const createdBy = quotation?.created_by ? Number(quotation.created_by) : null;
  const assignedTo = quotation?.assigned_to ? Number(quotation.assigned_to) : null;

  return createdBy === actorId || assignedTo === actorId;
}

function toIsoDateOnly(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

export async function getSalesDashboardStats(req, res, next) {
  try {
    const [[totalProducts]] = await dbPool.execute(`SELECT COUNT(*) AS count FROM products`);
    const [[availableStock]] = await dbPool.execute(
      `SELECT COALESCE(SUM(stock_quantity), 0) AS total FROM products`
    );
    const [[todaysSales]] = await dbPool.execute(
      `SELECT COALESCE(SUM(total_amount), 0) AS total
       FROM orders
       WHERE DATE(created_at) = CURRENT_DATE AND status <> 'cancelled'`
    );
    const [[monthlyRevenue]] = await dbPool.execute(
      `SELECT COALESCE(SUM(total_amount), 0) AS total
       FROM orders
       WHERE YEAR(created_at) = YEAR(CURRENT_DATE)
         AND MONTH(created_at) = MONTH(CURRENT_DATE)
         AND status <> 'cancelled'`
    );
    const [[pendingOrders]] = await dbPool.execute(
      `SELECT COUNT(*) AS count FROM orders WHERE status = 'pending'`
    );
    const [[totalEnquiries]] = await dbPool.execute(`SELECT COUNT(*) AS count FROM enquiries`);
    const [[newEnquiries]] = await dbPool.execute(
      `SELECT COUNT(*) AS count FROM enquiries WHERE status = 'new'`
    );
    const [[totalQuotations]] = await dbPool.execute(`SELECT COUNT(*) AS count FROM quotations`);
    const [[pendingQuotationApprovals]] = await dbPool.execute(
      `SELECT COUNT(*) AS count FROM quotations WHERE quotation_status = 'pending_approval'`
    );

    const [salesTrend] = await dbPool.execute(
      `SELECT
         DATE_FORMAT(created_at, '%b %d') AS label,
         ROUND(SUM(total_amount), 2) AS revenue,
         COUNT(*) AS orders
       FROM orders
       WHERE created_at >= (CURRENT_DATE - INTERVAL 29 DAY)
       GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%b %d')
       ORDER BY DATE(created_at) ASC`
    );

    const [enquiryStatusBreakdown] = await dbPool.execute(
      `SELECT status, COUNT(*) AS total
       FROM enquiries
       GROUP BY status
       ORDER BY status ASC`
    );

    const [[maxStockRow]] = await dbPool.execute(
      `SELECT COALESCE(MAX(stock_quantity), 0) AS max_stock FROM products`
    );
    const [topProductRows] = await dbPool.execute(
      `SELECT id, name, brand, stock_quantity
       FROM products
       WHERE status = 'approved'
       ORDER BY stock_quantity ASC, updated_at DESC
       LIMIT 6`
    );
    const [recentEnquiries] = await dbPool.execute(
      `SELECT id, CONCAT('ENQ-', LPAD(id, 6, '0')) AS enquiry_code, customer_name, product_name, quantity, status, created_at
       FROM enquiries
       ORDER BY created_at DESC
       LIMIT 8`
    );

    const maxStock = Number(maxStockRow.max_stock || 0);
    const topSellingProducts = topProductRows.map((row) => ({
      id: Number(row.id || 0),
      name: row.name,
      brand: row.brand,
      units_sold: Math.max(1, maxStock - Number(row.stock_quantity || 0) + 1),
    }));

    return res.json({
      cards: {
        totalProducts: Number(totalProducts.count || 0),
        availableStock: Number(availableStock.total || 0),
        todaysSales: Number(todaysSales.total || 0),
        monthlyRevenue: Number(monthlyRevenue.total || 0),
        pendingOrders: Number(pendingOrders.count || 0),
        totalEnquiries: Number(totalEnquiries.count || 0),
        newEnquiries: Number(newEnquiries.count || 0),
        totalQuotations: Number(totalQuotations.count || 0),
        pendingQuotationApprovals: Number(pendingQuotationApprovals.count || 0),
      },
      charts: {
        salesTrend,
        topSellingProducts,
        enquiryStatusBreakdown,
      },
      recentEnquiries,
    });
  } catch (error) {
    return next(error);
  }
}

export async function listSalesProducts(req, res, next) {
  try {
    const [rows] = await dbPool.execute(
      `SELECT p.*, c.name AS category_name, b.name AS brand_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN brands b ON b.id = p.brand_id
       ORDER BY p.updated_at DESC
       LIMIT 500`
    );

    return res.json({ products: rows.map(mapProductRow) });
  } catch (error) {
    return next(error);
  }
}

export async function listSalesInventory(req, res, next) {
  return listSalesProducts(req, res, next);
}

export async function listSalesOrders(req, res, next) {
  try {
    const rows = await listOrderRows({
      search: req.query.search || "",
      status: req.query.status || "",
    });

    return res.json({ orders: rows });
  } catch (error) {
    return next(error);
  }
}

export async function createSalesOrder(req, res, next) {
  try {
    const payload = {
      customer_id: Number(req.body.customer_id),
      order_number: String(req.body.order_number || "").trim(),
      total_amount: Number(req.body.total_amount || 0),
      status: req.body.status || "pending",
      support_status: req.body.support_status || "open",
    };

    const customer = await findCustomerById(payload.customer_id);
    if (!customer) {
      return res.status(400).json({ message: "Selected customer does not exist" });
    }

    const result = await createOrder(payload);

    await logAudit({
      userId: req.user.id,
      action: "create_sales_order",
      entityType: "order",
      entityId: result.insertId,
      details: payload,
    });

    return res.status(201).json({
      message: "Sales order created",
      orderId: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Order number already exists" });
    }

    return next(error);
  }
}

export async function updateSalesOrderStatus(req, res, next) {
  try {
    const orderId = Number(req.params.id);
    const result = await updateOrderById(orderId, {
      status: req.body.status,
      support_status: req.body.support_status,
    });

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Order not found" });
    }

    await logAudit({
      userId: req.user.id,
      action: "update_sales_order_status",
      entityType: "order",
      entityId: orderId,
      details: {
        status: req.body.status || null,
        support_status: req.body.support_status || null,
      },
    });

    return res.json({ message: "Order updated" });
  } catch (error) {
    return next(error);
  }
}

export async function listSalesCustomers(req, res, next) {
  try {
    const rows = await listCustomerRows({ search: req.query.search || "" });
    return res.json({ customers: rows });
  } catch (error) {
    return next(error);
  }
}

export async function createSalesCustomer(req, res, next) {
  try {
    const payload = normalizeCustomerPayload(req.body);
    const result = await createCustomer(payload);

    await logAudit({
      userId: req.user.id,
      action: "create_sales_customer",
      entityType: "customer",
      entityId: result.insertId,
      details: payload,
    });

    return res.status(201).json({
      message: "Customer created",
      customerId: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Customer email already exists" });
    }

    return next(error);
  }
}

export async function updateSalesCustomer(req, res, next) {
  try {
    const customerId = Number(req.params.id);
    const currentCustomer = await findCustomerById(customerId);

    if (!currentCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const payload = normalizeCustomerPayload({
      ...currentCustomer,
      ...req.body,
    });

    const result = await updateCustomerById(customerId, payload);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Customer not found" });
    }

    await logAudit({
      userId: req.user.id,
      action: "update_sales_customer",
      entityType: "customer",
      entityId: customerId,
      details: payload,
    });

    return res.json({ message: "Customer updated" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Customer email already exists" });
    }

    return next(error);
  }
}

export async function listSalesInvoices(req, res, next) {
  try {
    const rows = await listInvoiceRows({
      search: req.query.search || "",
      status: req.query.status || "",
    });

    return res.json({ invoices: rows.map(mapInvoiceRow) });
  } catch (error) {
    return next(error);
  }
}

export async function createSalesInvoice(req, res, next) {
  try {
    const payload = {
      invoice_number: String(req.body.invoice_number || "").trim(),
      customer_id: Number(req.body.customer_id),
      order_id: req.body.order_id ? Number(req.body.order_id) : null,
      total_amount: Number(req.body.total_amount || 0),
      status: req.body.status || "issued",
      due_date: req.body.due_date || null,
      issued_at: req.body.issued_at || new Date(),
      created_by: req.user.id,
    };

    const customer = await findCustomerById(payload.customer_id);
    if (!customer) {
      return res.status(400).json({ message: "Selected customer does not exist" });
    }

    if (payload.order_id) {
      const [[orderRow]] = await dbPool.execute(
        `SELECT id, customer_id FROM orders WHERE id = ? LIMIT 1`,
        [payload.order_id]
      );

      if (!orderRow) {
        return res.status(400).json({ message: "Selected order does not exist" });
      }

      if (Number(orderRow.customer_id) !== payload.customer_id) {
        return res.status(400).json({ message: "Selected order does not belong to that customer" });
      }
    }

    const result = await createInvoice(payload);

    await logAudit({
      userId: req.user.id,
      action: "create_sales_invoice",
      entityType: "invoice",
      entityId: result.insertId,
      details: payload,
    });

    return res.status(201).json({
      message: "Invoice created",
      invoiceId: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Invoice number already exists" });
    }

    return next(error);
  }
}

export async function listSalesEnquiries(req, res, next) {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const pageSize = Math.min(50, toPositiveInt(req.query.page_size, 10));
    const mineOnly =
      String(req.query.mine || "")
        .trim()
        .toLowerCase() === "1" ||
      String(req.query.mine || "")
        .trim()
        .toLowerCase() === "true";

    const response = await listEnquiries({
      search: req.query.search || "",
      status: normalizeEnquiryStatus(req.query.status || "", ""),
      page,
      pageSize,
      actorRole: req.user.role,
      actorId: req.user.id,
      mineOnly,
    });

    return res.json({
      enquiries: response.rows,
      pagination: {
        page: response.page,
        pageSize: response.pageSize,
        total: response.total,
        totalPages: Math.max(1, Math.ceil(response.total / response.pageSize)),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getSalesEnquiryById(req, res, next) {
  try {
    const enquiryId = Number(req.params.id);
    const enquiry = await findEnquiryById(enquiryId);

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    if (!canAccessSalesEnquiry(req.user, enquiry)) {
      return res.status(403).json({ message: "You can access only your assigned enquiries." });
    }

    return res.json({ enquiry });
  } catch (error) {
    return next(error);
  }
}

export async function updateSalesEnquiryStatus(req, res, next) {
  try {
    const enquiryId = Number(req.params.id);
    const nextStatus = normalizeEnquiryStatus(req.body.status, "");

    if (!nextStatus) {
      return res.status(400).json({ message: "Invalid enquiry status" });
    }

    const enquiry = await findEnquiryById(enquiryId);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    if (!canAccessSalesEnquiry(req.user, enquiry)) {
      return res.status(403).json({ message: "You can update only your assigned enquiries." });
    }

    const role = normalizeUserRole(req.user.role);
    let assignedTo = enquiry.assigned_to;
    if (role === "sales" && !assignedTo) {
      assignedTo = Number(req.user.id);
    }

    const timestampNow = new Date();
    const updates = {
      status: nextStatus,
      assigned_to: assignedTo,
    };
    if (nextStatus === "contacted") {
      updates.contacted_at = timestampNow;
    }
    if (nextStatus === "quoted") {
      updates.quoted_at = timestampNow;
    }
    if (nextStatus === "closed") {
      updates.closed_at = timestampNow;
    }

    await updateEnquiryById(enquiryId, updates);

    await logAudit({
      userId: req.user.id,
      action: "update_sales_enquiry_status",
      entityType: "enquiry",
      entityId: enquiryId,
      details: {
        status: nextStatus,
        assigned_to: assignedTo || null,
      },
    });

    return res.json({ message: "Enquiry status updated" });
  } catch (error) {
    return next(error);
  }
}

export async function assignSalesEnquiry(req, res, next) {
  try {
    const enquiryId = Number(req.params.id);
    const enquiry = await findEnquiryById(enquiryId);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    const assignedTo = req.body.assigned_to ? Number(req.body.assigned_to) : null;
    if (assignedTo) {
      const [[userRow]] = await dbPool.execute(
        `SELECT id, role FROM users WHERE id = ? LIMIT 1`,
        [assignedTo]
      );
      if (!userRow) {
        return res.status(400).json({ message: "Assigned sales user not found" });
      }
      if (normalizeUserRole(userRow.role) !== "sales") {
        return res.status(400).json({ message: "Only users with Sales role can be assigned." });
      }
    }

    await updateEnquiryById(enquiryId, { assigned_to: assignedTo });

    await logAudit({
      userId: req.user.id,
      action: "assign_sales_enquiry",
      entityType: "enquiry",
      entityId: enquiryId,
      details: {
        assigned_to: assignedTo,
      },
    });

    return res.json({ message: assignedTo ? "Enquiry assigned" : "Enquiry unassigned" });
  } catch (error) {
    return next(error);
  }
}

export async function listSalesAssignedCustomers(req, res, next) {
  try {
    const role = normalizeUserRole(req.user.role);
    if (role !== "sales") {
      return res.json({ customers: [] });
    }

    const customers = await listAssignedCustomers(req.user.id);
    return res.json({ customers });
  } catch (error) {
    return next(error);
  }
}

export async function createQuotationFromEnquiry(req, res, next) {
  try {
    const enquiryId = Number(req.params.id);
    const enquiry = await findEnquiryById(enquiryId);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    if (!canAccessSalesEnquiry(req.user, enquiry)) {
      return res.status(403).json({ message: "You can create quotation only for assigned enquiries." });
    }

    const role = normalizeUserRole(req.user.role);
    let assignedTo = enquiry.assigned_to;
    if (role === "sales" && !assignedTo) {
      assignedTo = Number(req.user.id);
    }

    const unitPrice = toMoney(req.body.price, -1);
    if (unitPrice < 0) {
      return res.status(400).json({ message: "Price must be a valid amount" });
    }

    const quantity = toPositiveInt(req.body.quantity, enquiry.quantity || 1);
    const discountPercentRaw = Number(req.body.discount || 0);
    const discountPercent = Number.isFinite(discountPercentRaw)
      ? Math.min(100, Math.max(0, discountPercentRaw))
      : 0;
    const { subtotalAmount, discountAmount, totalAmount } = computeQuotationAmounts({
      unitPrice,
      quantity,
      discountPercent,
    });

    const fallbackValidDate = new Date();
    fallbackValidDate.setDate(fallbackValidDate.getDate() + 7);
    const validUntilDate = toIsoDateOnly(req.body.valid_until || fallbackValidDate);
    if (!validUntilDate) {
      return res.status(400).json({ message: "Valid until date is required" });
    }

    const initialQuotationStatus = role === "sales" ? "pending_approval" : "approved";
    const now = new Date();

    const createdResult = await createQuotation({
      enquiry_id: enquiryId,
      quotation_status: initialQuotationStatus,
      customer_name: enquiry.customer_name,
      customer_email: enquiry.email,
      customer_phone: enquiry.phone,
      product_id: enquiry.product_id,
      product_name: req.body.product_name
        ? String(req.body.product_name).trim()
        : enquiry.product_name,
      unit_price: unitPrice,
      quantity,
      discount_percent: discountPercent,
      subtotal_amount: subtotalAmount,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      valid_until: validUntilDate,
      notes: req.body.notes ? String(req.body.notes).trim() : null,
      created_by: req.user.id,
      approved_by: initialQuotationStatus === "approved" ? req.user.id : null,
      approved_at: initialQuotationStatus === "approved" ? now : null,
    });

    await updateEnquiryById(enquiryId, {
      status: "quoted",
      quoted_at: now,
      assigned_to: assignedTo,
    });

    const quotation = await findQuotationById(createdResult.insertId);
    const pdfBuffer = await buildQuotationPdfBuffer(quotation);

    await logAudit({
      userId: req.user.id,
      action: "create_sales_quotation",
      entityType: "quotation",
      entityId: createdResult.insertId,
      details: {
        enquiry_id: enquiryId,
        quotation_status: initialQuotationStatus,
        unit_price: unitPrice,
        quantity,
        discount_percent: discountPercent,
        total_amount: totalAmount,
        valid_until: validUntilDate,
      },
    });

    return res.status(201).json({
      message:
        initialQuotationStatus === "approved"
          ? "Quotation created"
          : "Quotation created and pending approval",
      quotation,
      requiresApproval: initialQuotationStatus === "pending_approval",
      pdf_base64: pdfBuffer.toString("base64"),
    });
  } catch (error) {
    return next(error);
  }
}

export async function listSalesQuotations(req, res, next) {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const pageSize = Math.min(50, toPositiveInt(req.query.page_size, 10));
    const status = normalizeQuotationStatus(req.query.status || "", "");

    const response = await listQuotations({
      search: req.query.search || "",
      status,
      page,
      pageSize,
      actorRole: req.user.role,
      actorId: req.user.id,
    });

    return res.json({
      quotations: response.rows,
      pagination: {
        page: response.page,
        pageSize: response.pageSize,
        total: response.total,
        totalPages: Math.max(1, Math.ceil(response.total / response.pageSize)),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getSalesQuotationById(req, res, next) {
  try {
    const quotationId = Number(req.params.id);
    const quotation = await findQuotationById(quotationId);
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    if (!canAccessSalesQuotation(req.user, quotation)) {
      return res.status(403).json({ message: "You can access only your own quotations." });
    }

    const includePdf =
      String(req.query.include_pdf || "")
        .trim()
        .toLowerCase() === "1" ||
      String(req.query.include_pdf || "")
        .trim()
        .toLowerCase() === "true";

    if (!includePdf) {
      return res.json({ quotation });
    }

    const pdfBuffer = await buildQuotationPdfBuffer(quotation);
    return res.json({
      quotation,
      pdf_base64: pdfBuffer.toString("base64"),
    });
  } catch (error) {
    return next(error);
  }
}

export async function approveSalesQuotation(req, res, next) {
  try {
    const quotationId = Number(req.params.id);
    const quotation = await findQuotationById(quotationId);
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    await updateQuotationById(quotationId, {
      quotation_status: "approved",
      approved_by: req.user.id,
      approved_at: new Date(),
    });

    await logAudit({
      userId: req.user.id,
      action: "approve_sales_quotation",
      entityType: "quotation",
      entityId: quotationId,
      details: {
        previous_status: quotation.quotation_status,
        next_status: "approved",
      },
    });

    return res.json({ message: "Quotation approved" });
  } catch (error) {
    return next(error);
  }
}

export async function sendSalesQuotation(req, res, next) {
  try {
    const quotationId = Number(req.params.id);
    const quotation = await findQuotationById(quotationId);
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    if (!canAccessSalesQuotation(req.user, quotation)) {
      return res.status(403).json({ message: "You can send only your own quotations." });
    }

    const role = normalizeUserRole(req.user.role);
    const quotationStatus = normalizeQuotationStatus(quotation.quotation_status, "pending_approval");

    if (["expired", "rejected"].includes(quotationStatus)) {
      return res.status(400).json({ message: "This quotation cannot be sent in its current status." });
    }

    if (!["approved", "sent"].includes(quotationStatus) && role === "sales") {
      return res.status(403).json({ message: "Quotation must be approved by super admin before sending." });
    }

    const pdfBuffer = await buildQuotationPdfBuffer(quotation);
    const customSubject = req.body.subject ? String(req.body.subject).trim() : "";
    const customBody = req.body.body ? String(req.body.body).trim() : "";
    const emailResponse = await sendQuotationEmail({
      quotation,
      pdfBuffer,
      subject: customSubject || undefined,
      customText: customBody || "",
      customHtml: "",
    });

    const updates = {
      quotation_status: "sent",
      sent_by: req.user.id,
      sent_at: new Date(),
      email_subject: emailResponse.subject,
      email_body: emailResponse.bodyText,
    };

    if (!quotation.approved_by) {
      updates.approved_by = req.user.id;
      updates.approved_at = new Date();
    }

    await updateQuotationById(quotationId, updates);
    await updateEnquiryById(Number(quotation.enquiry_id), {
      status: "quoted",
      quoted_at: new Date(),
    });

    await logAudit({
      userId: req.user.id,
      action: "send_sales_quotation",
      entityType: "quotation",
      entityId: quotationId,
      details: {
        deliveryMode: emailResponse.deliveryMode,
        messageId: emailResponse.messageId,
      },
    });

    return res.json({
      message: "Quotation email sent successfully",
      messageId: emailResponse.messageId,
      deliveryMode: emailResponse.deliveryMode,
      preview: emailResponse.preview,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createSalesEnquiry(req, res, next) {
  try {
    const payload = {
      customer_name: String(req.body.customer_name || "").trim(),
      email: String(req.body.email || "")
        .trim()
        .toLowerCase(),
      phone: String(req.body.phone || "").trim(),
      product_id: req.body.product_id ? Number(req.body.product_id) : null,
      product_name: String(req.body.product_name || "").trim(),
      quantity: toPositiveInt(req.body.quantity, 1),
      message: req.body.message ? String(req.body.message).trim() : null,
      status: normalizeEnquiryStatus(req.body.status || "new", "new"),
      source: "admin",
      assigned_to: normalizeUserRole(req.user.role) === "sales" ? req.user.id : null,
    };

    if (payload.product_id) {
      const [[productRow]] = await dbPool.execute(
        `SELECT id, name FROM products WHERE id = ? LIMIT 1`,
        [payload.product_id]
      );
      if (!productRow) {
        return res.status(400).json({ message: "Selected product does not exist" });
      }
      if (!payload.product_name) {
        payload.product_name = productRow.name;
      }
    }

    if (!payload.product_name) {
      return res.status(400).json({ message: "Product name is required" });
    }

    const result = await createEnquiry(payload);

    await logAudit({
      userId: req.user.id,
      action: "create_sales_enquiry",
      entityType: "enquiry",
      entityId: result.insertId,
      details: payload,
    });

    return res.status(201).json({
      message: "Enquiry created",
      enquiryId: result.insertId,
      enquiryCode: result.enquiryCode,
    });
  } catch (error) {
    return next(error);
  }
}
