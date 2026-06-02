import { dbPool } from "../config/db.js";
import { listCustomers as listCustomerRows } from "../models/customerModel.js";
import { listOrders as listOrderRows } from "../models/orderModel.js";
import { logAudit } from "../utils/audit.js";
import { ensureBrandReference, ensureCategoryReference } from "../utils/productReferences.js";
import { mapProductRow, parseJson } from "../utils/serializers.js";

function sanitizeProductInput(data) {
  return {
    name: data.name,
    model: data.model,
    category_id: data.category_id === undefined ? null : Number(data.category_id),
    brand_id: data.brand_id === undefined ? null : Number(data.brand_id),
    category: data.category || null,
    brand: data.brand || null,
    price: Number(data.price || 0),
    stock_quantity: Math.max(0, Number(data.stock_quantity || 0)),
    description: data.description,
    specifications:
      typeof data.specifications === "string"
        ? parseJson(data.specifications, {})
        : data.specifications || {},
    image_url: data.image_url || null,
    brochure_url: data.brochure_url || null,
  };
}

export async function listOrders(req, res, next) {
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

function mapSubmissionStatus(status) {
  return status === "approved" || status === "rejected" ? status : "pending";
}

function mapProductSubmissionRow(row) {
  const changeData = parseJson(row.change_data, {});
  return {
    id: row.id,
    name: changeData.name || "-",
    model: changeData.model || "-",
    category: changeData.category || "-",
    price: Number(changeData.price || 0),
    approval_status: mapSubmissionStatus(row.status),
    created_at: row.created_at,
  };
}

function mapOrderSubmissionRow(row) {
  const changeData = parseJson(row.change_data, {});
  return {
    id: row.id,
    customer_id: Number(changeData.customer_id || 0),
    order_number: changeData.order_number || "-",
    total_amount: Number(changeData.total_amount || 0),
    status: changeData.status || "pending",
    support_status: changeData.support_status || "open",
    approval_status: mapSubmissionStatus(row.status),
    created_at: row.created_at,
  };
}

function mapCustomerSubmissionRow(row) {
  const changeData = parseJson(row.change_data, {});
  return {
    id: row.id,
    name: changeData.name || "-",
    email: changeData.email || "-",
    company: changeData.company || null,
    status: changeData.status || "active",
    approval_status: mapSubmissionStatus(row.status),
    created_at: row.created_at,
  };
}

export async function listProducts(req, res, next) {
  try {
    const [rows] = await dbPool.execute(
      `SELECT p.*, c.name AS category_name, b.name AS brand_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN brands b ON b.id = p.brand_id
       ORDER BY p.created_at DESC
       LIMIT 100`
    );

    return res.json({ products: rows.map(mapProductRow) });
  } catch (error) {
    return next(error);
  }
}

export async function listSubmissionQueue(req, res, next) {
  try {
    const [productRows] = await dbPool.execute(
      `SELECT id, change_data, status, created_at
       FROM product_changes
       WHERE requested_by = ?
       ORDER BY created_at DESC
       LIMIT 100`,
      [req.user.id]
    );
    const [orderRows] = await dbPool.execute(
      `SELECT id, change_data, status, created_at
       FROM order_changes
       WHERE requested_by = ?
       ORDER BY created_at DESC
       LIMIT 100`,
      [req.user.id]
    );
    const [customerRows] = await dbPool.execute(
      `SELECT id, change_data, status, created_at
       FROM customer_changes
       WHERE requested_by = ?
       ORDER BY created_at DESC
       LIMIT 100`,
      [req.user.id]
    );

    return res.json({
      products: productRows.map(mapProductSubmissionRow),
      orders: orderRows.map(mapOrderSubmissionRow),
      customers: customerRows.map(mapCustomerSubmissionRow),
    });
  } catch (error) {
    return next(error);
  }
}

export async function createOrderEntry(req, res, next) {
  try {
    const payload = {
      customer_id: Number(req.body.customer_id),
      order_number: String(req.body.order_number || "").trim(),
      total_amount: Number(req.body.total_amount || 0),
      status: req.body.status || "pending",
      support_status: req.body.support_status || "open",
    };

    const [[customerExists]] = await dbPool.execute(
      `SELECT id FROM customers WHERE id = ? LIMIT 1`,
      [payload.customer_id]
    );

    if (!customerExists) {
      return res.status(400).json({ message: "Selected customer does not exist" });
    }

    const [result] = await dbPool.execute(
      `INSERT INTO order_changes (change_type, change_data, requested_by, status)
       VALUES ('create', ?, ?, 'pending')`,
      [JSON.stringify(payload), req.user.id]
    );

    await logAudit({
      userId: req.user.id,
      action: "submit_order_entry",
      entityType: "order_change",
      entityId: result.insertId,
      details: payload,
    });

    return res.status(201).json({
      message: "Order submitted for approval",
      orderChangeId: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Order number already exists" });
    }

    return next(error);
  }
}

export async function listCustomers(req, res, next) {
  try {
    const rows = await listCustomerRows({ search: req.query.search || "" });
    return res.json({ customers: rows });
  } catch (error) {
    return next(error);
  }
}

export async function createCustomerEntry(req, res, next) {
  try {
    const payload = {
      name: String(req.body.name || "").trim(),
      email: String(req.body.email || "").trim().toLowerCase(),
      phone: req.body.phone || null,
      company: req.body.company || null,
      status: req.body.status || "active",
    };

    const [result] = await dbPool.execute(
      `INSERT INTO customer_changes (change_type, change_data, requested_by, status)
       VALUES ('create', ?, ?, 'pending')`,
      [JSON.stringify(payload), req.user.id]
    );

    await logAudit({
      userId: req.user.id,
      action: "submit_customer_entry",
      entityType: "customer_change",
      entityId: result.insertId,
      details: payload,
    });

    return res.status(201).json({
      message: "Customer submitted for approval",
      customerChangeId: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Customer email already exists" });
    }

    return next(error);
  }
}

export async function createProductEntry(req, res, next) {
  try {
    const payload = sanitizeProductInput(req.body);
    const category = await ensureCategoryReference({
      categoryId: payload.category_id,
      categoryName: payload.category,
    });
    const brand = await ensureBrandReference({
      brandId: payload.brand_id,
      brandName: payload.brand,
    });
    const normalizedPayload = {
      ...payload,
      category_id: category.id,
      brand_id: brand.id,
      category: category.name,
      brand: brand.name,
    };

    const [result] = await dbPool.execute(
      `INSERT INTO product_changes (product_id, change_type, change_data, requested_by, status)
       VALUES (NULL, 'create', ?, ?, 'pending')`,
      [JSON.stringify(normalizedPayload), req.user.id]
    );

    await logAudit({
      userId: req.user.id,
      action: "submit_product_entry",
      entityType: "product_change",
      entityId: result.insertId,
      details: normalizedPayload,
    });

    return res.status(201).json({
      message: "Product submitted for approval",
      productChangeId: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Duplicate product entry detected" });
    }

    return next(error);
  }
}
