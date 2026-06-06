import { dbPool } from "../config/db.js";
import { createHash, randomBytes } from "node:crypto";
import { listCustomers as listCustomerRows } from "../models/customerModel.js";
import {
  getBusinessDashboardMetrics,
  listOrders as listOrderRows,
  updateOrderById,
} from "../models/orderModel.js";
import { getSettings, upsertSettings } from "../models/settingModel.js";
import { listUsersWithActivity } from "../models/userModel.js";
import {
  approveCustomerChange,
  approveOrderChange,
  approveProductChange,
  rejectCustomerChange,
  rejectOrderChange,
  rejectProductChange,
} from "../services/approvalService.js";
import { logAudit } from "../utils/audit.js";
import { hashPassword } from "../utils/password.js";
import { ensureBrandReference, ensureCategoryReference } from "../utils/productReferences.js";
import { normalizeUserRole, USER_ROLE_VALUES } from "../utils/roles.js";
import { mapChangeRow, mapProductRow, parseJson } from "../utils/serializers.js";

const USER_STATUS_VALUES = Object.freeze(["active", "suspended", "disabled"]);

function normalizeUserStatus(status) {
  const normalizedStatus = String(status || "active")
    .trim()
    .toLowerCase();
  return USER_STATUS_VALUES.includes(normalizedStatus) ? normalizedStatus : "active";
}

function isSuperAdminRole(role) {
  return normalizeUserRole(role) === "super_admin";
}

function isAdminRole(role) {
  return normalizeUserRole(role) === "admin";
}

function canAssignRole(actorRole, targetRole) {
  if (targetRole === "admin" || targetRole === "super_admin") {
    return isSuperAdminRole(actorRole);
  }
  return true;
}

async function getManagedUserById(userId) {
  const [rows] = await dbPool.execute(
    `SELECT id, name, email, role, status, created_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

async function fetchProductRows() {
  const [rows] = await dbPool.execute(
    `SELECT p.*, c.name AS category_name, b.name AS brand_name,
            cu.name AS created_by_name, uu.name AS updated_by_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN brands b ON b.id = p.brand_id
     LEFT JOIN users cu ON cu.id = p.created_by
     LEFT JOIN users uu ON uu.id = p.updated_by
     ORDER BY p.updated_at DESC`
  );
  return rows;
}

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
    specifications: typeof data.specifications === "string"
      ? parseJson(data.specifications, {})
      : data.specifications || {},
    image_url: data.image_url || null,
    brochure_url: data.brochure_url || null,
    status: data.status || "approved",
    is_published: data.is_published === undefined ? 1 : Number(Boolean(data.is_published)),
  };
}

async function loadPaymentSettings() {
  const settings = await getSettings([
    "payment_currency",
    "payment_gateway_mode",
    "payment_auto_capture",
    "payment_retry_window_minutes",
  ]);

  return {
    currency: settings.payment_currency?.value || "INR",
    gatewayMode: settings.payment_gateway_mode?.value || "sandbox",
    autoCapture: Boolean(settings.payment_auto_capture?.value ?? true),
    retryWindowMinutes: Number(settings.payment_retry_window_minutes?.value || 15),
    updatedAt:
      settings.payment_retry_window_minutes?.updated_at ||
      settings.payment_auto_capture?.updated_at ||
      settings.payment_gateway_mode?.updated_at ||
      settings.payment_currency?.updated_at ||
      null,
    updatedBy: null,
  };
}

export async function getDashboardStats(req, res, next) {
  try {
    const businessMetrics = await getBusinessDashboardMetrics();
    const [[totalProducts]] = await dbPool.execute(`SELECT COUNT(*) AS count FROM products`);
    const [[totalCategories]] = await dbPool.execute(`SELECT COUNT(*) AS count FROM categories`);
    const [[totalBrands]] = await dbPool.execute(`SELECT COUNT(*) AS count FROM brands`);
    const [[pendingRequests]] = await dbPool.execute(
      `SELECT COUNT(*) AS count FROM product_changes WHERE status = 'pending'`
    );
    const [[approvedProducts]] = await dbPool.execute(
      `SELECT COUNT(*) AS count FROM products WHERE status = 'approved' AND is_published = 1`
    );
    const [[usersCount]] = await dbPool.execute(`SELECT COUNT(*) AS count FROM users`);
    const [[totalEnquiries]] = await dbPool.execute(`SELECT COUNT(*) AS count FROM enquiries`);
    const [[totalQuotations]] = await dbPool.execute(`SELECT COUNT(*) AS count FROM quotations`);
    const [recentOrders] = await dbPool.execute(
      `SELECT
         o.id,
         o.order_number,
         o.total_amount,
         o.status,
         o.created_at,
         c.name AS customer_name
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       ORDER BY o.created_at DESC
       LIMIT 8`
    );

    return res.json({
      widgets: [
        { label: "Total Orders", value: businessMetrics.totalOrders },
        { label: "Total Revenue", value: businessMetrics.totalRevenue },
        { label: "Total Users", value: businessMetrics.totalUsers },
        { label: "Total Products", value: businessMetrics.totalProducts },
      ],
      charts: {
        revenueTrend: businessMetrics.revenueTrend,
        orderStatusBreakdown: businessMetrics.orderStatusBreakdown,
      },
      totalOrders: businessMetrics.totalOrders,
      totalRevenue: businessMetrics.totalRevenue,
      totalProducts: totalProducts.count,
      pendingRequests: pendingRequests.count,
      approvedProducts: approvedProducts.count,
      usersCount: usersCount.count,
      totalUsers: usersCount.count,
      quickStats: {
        products: Number(totalProducts.count || 0),
        categories: Number(totalCategories.count || 0),
        brands: Number(totalBrands.count || 0),
        enquiries: Number(totalEnquiries.count || 0),
        quotations: Number(totalQuotations.count || 0),
      },
      recentOrders: recentOrders.map((row) => ({
        ...row,
        id: Number(row.id || 0),
        total_amount: Number(row.total_amount || 0),
      })),
      dashboardOverview: {
        totalProducts: Number(totalProducts.count || 0),
        totalEnquiries: Number(totalEnquiries.count || 0),
        totalSales: Number(businessMetrics.totalRevenue || 0),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function listProducts(req, res, next) {
  try {
    const rows = await fetchProductRows();
    return res.json({ products: rows.map(mapProductRow) });
  } catch (error) {
    return next(error);
  }
}

export async function listInventory(req, res, next) {
  try {
    const rows = await fetchProductRows();
    return res.json({ products: rows.map(mapProductRow) });
  } catch (error) {
    return next(error);
  }
}

export async function createProduct(req, res, next) {
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

    const [result] = await dbPool.execute(
      `INSERT INTO products
       (name, model, category_id, brand_id, category, brand, price, stock_quantity, description, specifications, image_url, brochure_url, status, is_published, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.name,
        payload.model,
        category.id,
        brand.id,
        category.name,
        brand.name,
        payload.price,
        payload.stock_quantity,
        payload.description,
        JSON.stringify(payload.specifications),
        payload.image_url,
        payload.brochure_url,
        payload.status,
        payload.is_published,
        req.user.id,
        req.user.id,
      ]
    );

    await logAudit({
      userId: req.user.id,
      action: "create_product",
      entityType: "product",
      entityId: result.insertId,
      details: payload,
    });

    return res.status(201).json({ message: "Product created", productId: result.insertId });
  } catch (error) {
    return next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const productId = Number(req.params.id);
    const payload = sanitizeProductInput(req.body);
    const category = await ensureCategoryReference({
      categoryId: payload.category_id,
      categoryName: payload.category,
    });
    const brand = await ensureBrandReference({
      brandId: payload.brand_id,
      brandName: payload.brand,
    });

    const [result] = await dbPool.execute(
      `UPDATE products
       SET name = ?, model = ?, category_id = ?, brand_id = ?, category = ?, brand = ?, price = ?, stock_quantity = ?, description = ?, specifications = ?,
           image_url = ?, brochure_url = ?, status = ?, is_published = ?, updated_by = ?
       WHERE id = ?`,
      [
        payload.name,
        payload.model,
        category.id,
        brand.id,
        category.name,
        brand.name,
        payload.price,
        payload.stock_quantity,
        payload.description,
        JSON.stringify(payload.specifications),
        payload.image_url,
        payload.brochure_url,
        payload.status,
        payload.is_published,
        req.user.id,
        productId,
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Product not found" });
    }

    await logAudit({
      userId: req.user.id,
      action: "update_product",
      entityType: "product",
      entityId: productId,
      details: payload,
    });

    return res.json({ message: "Product updated" });
  } catch (error) {
    return next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const productId = Number(req.params.id);

    const [result] = await dbPool.execute(`DELETE FROM products WHERE id = ?`, [productId]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Product not found" });
    }

    await logAudit({
      userId: req.user.id,
      action: "delete_product",
      entityType: "product",
      entityId: productId,
    });

    return res.json({ message: "Product deleted" });
  } catch (error) {
    return next(error);
  }
}

export async function publishProduct(req, res, next) {
  try {
    const productId = Number(req.params.id);
    const { published } = req.body;

    const [result] = await dbPool.execute(
      `UPDATE products SET is_published = ?, updated_by = ? WHERE id = ?`,
      [Number(Boolean(published)), req.user.id, productId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Product not found" });
    }

    await logAudit({
      userId: req.user.id,
      action: published ? "publish_product" : "unpublish_product",
      entityType: "product",
      entityId: productId,
      details: { published: Boolean(published) },
    });

    return res.json({ message: published ? "Product published" : "Product unpublished" });
  } catch (error) {
    return next(error);
  }
}

export async function listPendingChanges(req, res, next) {
  try {
    const requestedBucket = String(req.query.bucket || "all")
      .trim()
      .toLowerCase();
    const validBuckets = new Set(["all", "products", "orders", "customers", "price_changes"]);
    const bucket = validBuckets.has(requestedBucket) ? requestedBucket : "all";

    const [productRows] = await dbPool.execute(
      `SELECT pc.*, u.name AS requested_by_name, u.email AS requested_by_email,
              p.name AS product_name, p.model AS product_model, p.price AS current_price
       FROM product_changes pc
       JOIN users u ON u.id = pc.requested_by
       LEFT JOIN products p ON p.id = pc.product_id
       WHERE pc.status = 'pending'
       ORDER BY pc.created_at ASC`
    );
    const [orderRows] = await dbPool.execute(
      `SELECT oc.*, u.name AS requested_by_name, u.email AS requested_by_email
       FROM order_changes oc
       JOIN users u ON u.id = oc.requested_by
       WHERE oc.status = 'pending'
       ORDER BY oc.created_at ASC`
    );
    const [customerRows] = await dbPool.execute(
      `SELECT cc.*, u.name AS requested_by_name, u.email AS requested_by_email
       FROM customer_changes cc
       JOIN users u ON u.id = cc.requested_by
       WHERE cc.status = 'pending'
       ORDER BY cc.created_at ASC`
    );

    const productChanges = productRows.map((rawRow) => {
      const row = mapChangeRow(rawRow);
      const requestedPrice = Number(row.change_data?.price);
      const currentPrice = Number(rawRow.current_price || 0);
      const isPriceChange =
        row.change_type === "update" && Number.isFinite(requestedPrice) && requestedPrice !== currentPrice;

      return {
        id: row.id,
        entity_type: "product",
        change_type: row.change_type,
        requested_by_name: row.requested_by_name,
        requested_by_email: row.requested_by_email,
        created_at: row.created_at,
        display_name: row.product_name || row.change_data?.name || "New Product",
        payload: row.change_data || {},
        approval_bucket: isPriceChange ? "price_changes" : "products",
      };
    });

    const orderChanges = orderRows.map((row) => {
      const payload = parseJson(row.change_data, {});
      return {
        id: row.id,
        entity_type: "order",
        change_type: row.change_type,
        requested_by_name: row.requested_by_name,
        requested_by_email: row.requested_by_email,
        created_at: row.created_at,
        display_name: payload.order_number || `Order Request #${row.id}`,
        payload,
        approval_bucket: "orders",
      };
    });

    const customerChanges = customerRows.map((row) => {
      const payload = parseJson(row.change_data, {});
      return {
        id: row.id,
        entity_type: "customer",
        change_type: row.change_type,
        requested_by_name: row.requested_by_name,
        requested_by_email: row.requested_by_email,
        created_at: row.created_at,
        display_name: payload.name || payload.email || `Customer Request #${row.id}`,
        payload,
        approval_bucket: "customers",
      };
    });

    const allChanges = [...productChanges, ...orderChanges, ...customerChanges].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const changes =
      bucket === "all"
        ? allChanges
        : allChanges.filter((row) =>
            bucket === "products"
              ? row.approval_bucket === "products"
              : row.approval_bucket === bucket
          );

    const counts = {
      all: allChanges.length,
      products: allChanges.filter((row) => row.approval_bucket === "products").length,
      orders: allChanges.filter((row) => row.approval_bucket === "orders").length,
      customers: allChanges.filter((row) => row.approval_bucket === "customers").length,
      price_changes: allChanges.filter((row) => row.approval_bucket === "price_changes").length,
    };

    return res.json({ bucket, counts, changes });
  } catch (error) {
    return next(error);
  }
}

export async function approveChange(req, res, next) {
  try {
    const changeId = Number(req.params.id);
    const entityType = String(req.body.entityType || req.query.entityType || "product")
      .trim()
      .toLowerCase();

    if (entityType === "product") {
      if (normalizeUserRole(req.user.role) !== "admin") {
        return res.status(403).json({ message: "Only admin can approve product submissions." });
      }

      const result = await approveProductChange(changeId, req.user.id);
      let product = null;

      if (result.changeType !== "delete" && result.productId) {
        const [rows] = await dbPool.execute(`SELECT * FROM products WHERE id = ? LIMIT 1`, [result.productId]);
        product = rows.length ? mapProductRow(rows[0]) : null;
      }

      return res.json({ message: "Product request approved", entityType, ...result, product });
    }

    if (entityType === "order") {
      const result = await approveOrderChange(changeId, req.user.id);
      return res.json({ message: "Order request approved", entityType, ...result });
    }

    if (entityType === "customer") {
      const result = await approveCustomerChange(changeId, req.user.id);
      return res.json({ message: "Customer request approved", entityType, ...result });
    }

    return res.status(400).json({ message: "Unsupported pending change type" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Duplicate record detected. Review submission details." });
    }

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ message: "Referenced entity is missing. Review request payload." });
    }

    return next(error);
  }
}

export async function rejectChange(req, res, next) {
  try {
    const changeId = Number(req.params.id);
    const entityType = String(req.body.entityType || req.query.entityType || "product")
      .trim()
      .toLowerCase();
    const reason = req.body.reason || "";

    if (entityType === "product") {
      await rejectProductChange(changeId, req.user.id, reason);
      return res.json({ message: "Product request rejected", entityType, changeId });
    }

    if (entityType === "order") {
      await rejectOrderChange(changeId, req.user.id, reason);
      return res.json({ message: "Order request rejected", entityType, changeId });
    }

    if (entityType === "customer") {
      await rejectCustomerChange(changeId, req.user.id, reason);
      return res.json({ message: "Customer request rejected", entityType, changeId });
    }

    return res.status(400).json({ message: "Unsupported pending change type" });
  } catch (error) {
    return next(error);
  }
}

export async function listUsers(req, res, next) {
  try {
    const rows = await listUsersWithActivity();

    return res.json({
      users: rows.map((row) => ({
        ...row,
        role: normalizeUserRole(row.role),
        status: normalizeUserStatus(row.status),
        activity_count: Number(row.activity_count || 0),
      })),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getRoleManagementOverview(req, res) {
  return res.json({
    roles: USER_ROLE_VALUES,
    roleMetadata: {
      super_admin: { name: "Super Admin", priority: 1 },
      admin: { name: "Admin", priority: 2 },
      development_team: { name: "Development Team", priority: 3 },
      operator: { name: "Operator", priority: 4 },
      sales: { name: "Sales Team", priority: 5 },
    },
    restrictedRoles: ["development_team", "operator", "sales"],
    permissionMatrix: {
      super_admin: [
        "dashboard",
        "products",
        "orders",
        "customers",
        "approvals",
        "users",
        "roles_permissions",
        "billing",
        "audit_logs",
        "system_logs",
        "settings",
        "api_keys",
      ],
      admin: ["dashboard", "products", "orders", "customers", "approvals", "users", "analytics", "inventory"],
      development_team: ["system_logs_read_only", "dev_tools", "api_docs", "system_health", "error_tracker"],
      operator: ["submit_product", "submit_order", "submit_customer"],
      sales: [
        "dashboard_analytics",
        "products_view",
        "inventory_view",
        "enquiries_view_update",
        "quotations_create_send",
        "assigned_customers_view",
        "sales_orders_create_update",
        "customers_create_update",
        "invoices_create",
      ],
    },
    message: "Role and permission management is restricted to super_admin.",
  });
}

export async function createUser(req, res, next) {
  try {
    const actorRole = normalizeUserRole(req.user.role);
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");
    const role = normalizeUserRole(req.body.role);
    const status = normalizeUserStatus(req.body.status || "active");

    if (!canAssignRole(actorRole, role)) {
      return res.status(403).json({ message: "Only super admin can assign admin roles." });
    }

    const hashedPassword = await hashPassword(password);

    const [result] = await dbPool.execute(
      `INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, role, status]
    );

    await logAudit({
      userId: req.user.id,
      action: "create_user",
      entityType: "user",
      entityId: result.insertId,
      details: { name, email, role, status },
    });

    return res.status(201).json({ message: "User created", userId: result.insertId });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already exists" });
    }

    return next(error);
  }
}

export async function getPaymentSettings(req, res, next) {
  try {
    const settings = await loadPaymentSettings();
    return res.json({ settings });
  } catch (error) {
    return next(error);
  }
}

export async function updatePaymentSettings(req, res, next) {
  try {
    const currentSettings = await loadPaymentSettings();
    const nextSettings = {
      currency: req.body.currency || currentSettings.currency,
      gatewayMode: req.body.gatewayMode || currentSettings.gatewayMode,
      autoCapture:
        req.body.autoCapture === undefined ? currentSettings.autoCapture : Boolean(req.body.autoCapture),
      retryWindowMinutes: Number(req.body.retryWindowMinutes || currentSettings.retryWindowMinutes),
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.email,
    };

    await upsertSettings(
      {
        payment_currency: nextSettings.currency,
        payment_gateway_mode: nextSettings.gatewayMode,
        payment_auto_capture: nextSettings.autoCapture,
        payment_retry_window_minutes: nextSettings.retryWindowMinutes,
      },
      req.user.id
    );

    await logAudit({
      userId: req.user.id,
      action: "update_payment_settings",
      entityType: "payment_settings",
      details: nextSettings,
    });

    return res.json({
      message: "Payment settings updated",
      settings: nextSettings,
    });
  } catch (error) {
    return next(error);
  }
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

export async function updateOrderStatus(req, res, next) {
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
      action: "update_order_status",
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

export async function listCustomers(req, res, next) {
  try {
    const rows = await listCustomerRows({ search: req.query.search || "" });
    return res.json({ customers: rows });
  } catch (error) {
    return next(error);
  }
}

export async function getSystemLogs(req, res, next) {
  try {
    const [errorLogs] = await dbPool.execute(
      `SELECT l.*, u.email AS user_email
       FROM audit_logs l
       LEFT JOIN users u ON u.id = l.user_id
       WHERE l.action = 'api_error'
       ORDER BY l.id DESC
       LIMIT 150`
    );

    const [auditLogs] = await dbPool.execute(
      `SELECT l.*, u.email AS user_email
       FROM audit_logs l
       LEFT JOIN users u ON u.id = l.user_id
       WHERE l.action <> 'api_error'
       ORDER BY l.id DESC
       LIMIT 150`
    );

    return res.json({
      errorLogs: errorLogs.map((row) => ({ ...row, details: parseJson(row.details, {}) })),
      auditLogs: auditLogs.map((row) => ({ ...row, details: parseJson(row.details, {}) })),
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const actorRole = normalizeUserRole(req.user.role);
    const actorId = Number(req.user.id);
    const userId = Number(req.params.id);
    const role = normalizeUserRole(req.body.role);
    const user = await getManagedUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentRole = normalizeUserRole(user.role);
    if (isAdminRole(actorRole) && isSuperAdminRole(currentRole)) {
      return res.status(403).json({ message: "Admin cannot change super admin roles." });
    }

    if (isAdminRole(actorRole) && actorId === userId && role === "super_admin") {
      return res.status(403).json({ message: "Admin cannot promote themselves to super admin." });
    }

    if (!canAssignRole(actorRole, role)) {
      return res.status(403).json({ message: "Only super admin can assign admin roles." });
    }

    await dbPool.execute(`UPDATE users SET role = ? WHERE id = ?`, [role, userId]);

    await logAudit({
      userId: req.user.id,
      action: "update_user_role",
      entityType: "user",
      entityId: userId,
      details: { role },
    });

    return res.json({ message: "User role updated" });
  } catch (error) {
    return next(error);
  }
}

export async function updateUserProfile(req, res, next) {
  try {
    const actorRole = normalizeUserRole(req.user.role);
    const userId = Number(req.params.id);
    const user = await getManagedUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentRole = normalizeUserRole(user.role);
    if (isAdminRole(actorRole) && isSuperAdminRole(currentRole)) {
      return res.status(403).json({ message: "Admin cannot edit super admin accounts." });
    }

    const name = String(req.body.name ?? user.name).trim();
    const email = String(req.body.email ?? user.email)
      .trim()
      .toLowerCase();

    await dbPool.execute(`UPDATE users SET name = ?, email = ? WHERE id = ?`, [name, email, userId]);

    await logAudit({
      userId: req.user.id,
      action: "update_user_profile",
      entityType: "user",
      entityId: userId,
      details: { name, email },
    });

    return res.json({ message: "User updated" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already exists" });
    }

    return next(error);
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    const actorRole = normalizeUserRole(req.user.role);
    const actorId = Number(req.user.id);
    const userId = Number(req.params.id);
    const status = normalizeUserStatus(req.body.status);
    const user = await getManagedUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentRole = normalizeUserRole(user.role);
    if (isAdminRole(actorRole) && isSuperAdminRole(currentRole)) {
      return res.status(403).json({ message: "Admin cannot change super admin status." });
    }

    if (userId === actorId && status !== "active") {
      return res.status(400).json({ message: "You cannot suspend or disable your own account." });
    }

    await dbPool.execute(`UPDATE users SET status = ? WHERE id = ?`, [status, userId]);

    await logAudit({
      userId: req.user.id,
      action: "update_user_status",
      entityType: "user",
      entityId: userId,
      details: { status },
    });

    return res.json({ message: "User status updated" });
  } catch (error) {
    return next(error);
  }
}

export async function resetUserPassword(req, res, next) {
  try {
    const actorRole = normalizeUserRole(req.user.role);
    const userId = Number(req.params.id);
    const user = await getManagedUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentRole = normalizeUserRole(user.role);
    if (isAdminRole(actorRole) && isSuperAdminRole(currentRole)) {
      return res.status(403).json({ message: "Admin cannot reset super admin password." });
    }

    const password = String(req.body.password || "");
    const hashedPassword = await hashPassword(password);

    await dbPool.execute(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, userId]);

    await logAudit({
      userId: req.user.id,
      action: "reset_user_password",
      entityType: "user",
      entityId: userId,
    });

    return res.json({ message: "User password reset" });
  } catch (error) {
    return next(error);
  }
}

async function handleDeleteUser(req, res, next, userId) {
  try {
    if (userId === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await getManagedUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentRole = normalizeUserRole(user.role);
    if (isSuperAdminRole(currentRole)) {
      return res.status(403).json({ message: "Super admin accounts cannot be deleted." });
    }

    const [result] = await dbPool.execute(`DELETE FROM users WHERE id = ?`, [userId]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: "User not found" });
    }

    await logAudit({
      userId: req.user.id,
      action: "delete_user",
      entityType: "user",
      entityId: userId,
    });

    return res.json({ message: "User deleted" });
  } catch (error) {
    return next(error);
  }
}

export async function deleteUser(req, res, next) {
  return handleDeleteUser(req, res, next, Number(req.params.id));
}

export async function deleteUserByBody(req, res, next) {
  return handleDeleteUser(req, res, next, Number(req.body.userId));
}

function generateApiKeyToken() {
  return `smarthome_${randomBytes(24).toString("hex")}`;
}

export async function listApiKeys(req, res, next) {
  try {
    const [rows] = await dbPool.execute(
      `SELECT id, key_name, key_prefix, role_scope, created_by, revoked_at, last_used_at, created_at
       FROM api_keys
       ORDER BY created_at DESC`
    );

    return res.json({ keys: rows });
  } catch (error) {
    return next(error);
  }
}

export async function createApiKey(req, res, next) {
  try {
    const keyName = String(req.body.keyName || "").trim();
    const roleScope = String(req.body.roleScope || "read_only").trim().toLowerCase();
    const rawKey = generateApiKeyToken();
    const keyPrefix = rawKey.slice(0, 18);
    const keyHash = createHash("sha256").update(rawKey).digest("hex");

    const [result] = await dbPool.execute(
      `INSERT INTO api_keys (key_name, key_prefix, key_hash, role_scope, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [keyName, keyPrefix, keyHash, roleScope, req.user.id]
    );

    await logAudit({
      userId: req.user.id,
      action: "create_api_key",
      entityType: "api_key",
      entityId: result.insertId,
      details: { keyName, roleScope, keyPrefix },
    });

    return res.status(201).json({
      message: "API key created",
      key: {
        id: result.insertId,
        key_name: keyName,
        key_prefix: keyPrefix,
        role_scope: roleScope,
        created_at: new Date().toISOString(),
      },
      rawKey,
    });
  } catch (error) {
    return next(error);
  }
}

export async function revokeApiKey(req, res, next) {
  try {
    const keyId = Number(req.params.id);
    const [result] = await dbPool.execute(
      `UPDATE api_keys
       SET revoked_at = COALESCE(revoked_at, NOW())
       WHERE id = ?`,
      [keyId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "API key not found" });
    }

    await logAudit({
      userId: req.user.id,
      action: "revoke_api_key",
      entityType: "api_key",
      entityId: keyId,
    });

    return res.json({ message: "API key revoked", keyId });
  } catch (error) {
    return next(error);
  }
}

export async function listAuditLogs(req, res, next) {
  try {
    const [rows] = await dbPool.execute(
      `SELECT l.*, u.name AS user_name, u.email AS user_email
       FROM audit_logs l
       LEFT JOIN users u ON u.id = l.user_id
       ORDER BY l.id DESC
       LIMIT 500`
    );

    return res.json({
      logs: rows.map((row) => ({
        ...row,
        details: parseJson(row.details, {}),
      })),
    });
  } catch (error) {
    return next(error);
  }
}
