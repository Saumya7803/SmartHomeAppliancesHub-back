import { dbPool } from "../config/db.js";
import { logAudit } from "../utils/audit.js";
import { ensureBrandReference, ensureCategoryReference } from "../utils/productReferences.js";
import { mapChangeRow, parseJson } from "../utils/serializers.js";

function normalizeProductPayload(rawPayload) {
  return {
    name: rawPayload.name,
    model: rawPayload.model,
    category_id: rawPayload.category_id === undefined ? null : Number(rawPayload.category_id),
    brand_id: rawPayload.brand_id === undefined ? null : Number(rawPayload.brand_id),
    category: rawPayload.category || null,
    brand: rawPayload.brand || null,
    price: Number(rawPayload.price || 0),
    stock_quantity: Math.max(0, Number(rawPayload.stock_quantity || 0)),
    description: rawPayload.description,
    specifications: rawPayload.specifications || {},
    image_url: rawPayload.image_url || null,
    brochure_url: rawPayload.brochure_url || null,
  };
}

function normalizeOrderPayload(rawPayload) {
  return {
    customer_id: Number(rawPayload.customer_id),
    order_number: String(rawPayload.order_number || "").trim(),
    total_amount: Number(rawPayload.total_amount || 0),
    status: rawPayload.status || "pending",
    support_status: rawPayload.support_status || "open",
  };
}

function normalizeCustomerPayload(rawPayload) {
  return {
    name: String(rawPayload.name || "").trim(),
    email: String(rawPayload.email || "").trim().toLowerCase(),
    phone: rawPayload.phone || null,
    company: rawPayload.company || null,
    status: rawPayload.status || "active",
  };
}

export async function approveProductChange(changeId, reviewerId) {
  const connection = await dbPool.getConnection();

  try {
    await connection.beginTransaction();

    const [changeRows] = await connection.execute(
      `SELECT * FROM product_changes WHERE id = ? AND status = 'pending' FOR UPDATE`,
      [changeId]
    );

    if (!changeRows.length) {
      const error = new Error("Pending change not found");
      error.statusCode = 404;
      throw error;
    }

    const change = mapChangeRow(changeRows[0]);
    let affectedProductId = change.product_id;

    if (change.change_type === "create") {
      const payload = normalizeProductPayload(parseJson(change.change_data, {}));
      const category = await ensureCategoryReference(
        { categoryId: payload.category_id, categoryName: payload.category },
        { connection }
      );
      const brand = await ensureBrandReference(
        { brandId: payload.brand_id, brandName: payload.brand },
        { connection }
      );

      const [insertResult] = await connection.execute(
        `INSERT INTO products
         (name, model, category_id, brand_id, category, brand, price, stock_quantity, description, specifications, image_url, brochure_url, status, is_published, created_by, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', 1, ?, ?)`,
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
          change.requested_by,
          reviewerId,
        ]
      );

      affectedProductId = insertResult.insertId;
    }

    if (change.change_type === "update") {
      const payload = normalizeProductPayload(parseJson(change.change_data, {}));
      const category = await ensureCategoryReference(
        { categoryId: payload.category_id, categoryName: payload.category },
        { connection }
      );
      const brand = await ensureBrandReference(
        { brandId: payload.brand_id, brandName: payload.brand },
        { connection }
      );

      const [updateResult] = await connection.execute(
        `UPDATE products
         SET name = ?, model = ?, category_id = ?, brand_id = ?, category = ?, brand = ?, price = ?, stock_quantity = ?, description = ?, specifications = ?, image_url = ?, brochure_url = ?, status = 'approved', updated_by = ?
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
          reviewerId,
          change.product_id,
        ]
      );

      if (!updateResult.affectedRows) {
        const error = new Error("Product for update request not found");
        error.statusCode = 404;
        throw error;
      }

      affectedProductId = change.product_id;
    }

    if (change.change_type === "delete") {
      const [deleteResult] = await connection.execute(`DELETE FROM products WHERE id = ?`, [change.product_id]);

      if (!deleteResult.affectedRows) {
        const error = new Error("Product for delete request not found");
        error.statusCode = 404;
        throw error;
      }

      affectedProductId = change.product_id;
    }

    await connection.execute(
      `UPDATE product_changes
       SET status = 'approved', reviewed_by = ?, reviewed_at = NOW(), product_id = COALESCE(product_id, ?)
       WHERE id = ?`,
      [reviewerId, affectedProductId, changeId]
    );

    await logAudit({
      userId: reviewerId,
      action: "approve_change",
      entityType: "product_change",
      entityId: changeId,
      details: {
        changeType: change.change_type,
        productId: affectedProductId,
      },
      connection,
    });

    await connection.commit();

    return {
      changeId,
      productId: affectedProductId,
      changeType: change.change_type,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function rejectProductChange(changeId, reviewerId, reason = "") {
  const [result] = await dbPool.execute(
    `UPDATE product_changes
     SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW(),
         change_data = JSON_SET(COALESCE(change_data, JSON_OBJECT()), '$.rejection_reason', ?)
     WHERE id = ? AND status = 'pending'`,
    [reviewerId, reason, changeId]
  );

  if (!result.affectedRows) {
    const error = new Error("Pending change not found");
    error.statusCode = 404;
    throw error;
  }

  await logAudit({
    userId: reviewerId,
    action: "reject_change",
    entityType: "product_change",
    entityId: changeId,
    details: { reason },
  });

  return { changeId };
}

export async function approveOrderChange(changeId, reviewerId) {
  const connection = await dbPool.getConnection();

  try {
    await connection.beginTransaction();

    const [changeRows] = await connection.execute(
      `SELECT * FROM order_changes WHERE id = ? AND status = 'pending' FOR UPDATE`,
      [changeId]
    );

    if (!changeRows.length) {
      const error = new Error("Pending order request not found");
      error.statusCode = 404;
      throw error;
    }

    const change = changeRows[0];
    const payload = normalizeOrderPayload(parseJson(change.change_data, {}));

    const [insertResult] = await connection.execute(
      `INSERT INTO orders (customer_id, order_number, total_amount, status, support_status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        payload.customer_id,
        payload.order_number,
        payload.total_amount,
        payload.status,
        payload.support_status,
      ]
    );

    await connection.execute(
      `UPDATE order_changes
       SET status = 'approved', reviewed_by = ?, reviewed_at = NOW(), order_id = ?
       WHERE id = ?`,
      [reviewerId, insertResult.insertId, changeId]
    );

    await logAudit({
      userId: reviewerId,
      action: "approve_order_change",
      entityType: "order_change",
      entityId: changeId,
      details: {
        orderId: insertResult.insertId,
      },
      connection,
    });

    await connection.commit();

    return {
      changeId,
      orderId: insertResult.insertId,
      changeType: "create",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function rejectOrderChange(changeId, reviewerId, reason = "") {
  const [result] = await dbPool.execute(
    `UPDATE order_changes
     SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW(),
         change_data = JSON_SET(COALESCE(change_data, JSON_OBJECT()), '$.rejection_reason', ?)
     WHERE id = ? AND status = 'pending'`,
    [reviewerId, reason, changeId]
  );

  if (!result.affectedRows) {
    const error = new Error("Pending order request not found");
    error.statusCode = 404;
    throw error;
  }

  await logAudit({
    userId: reviewerId,
    action: "reject_order_change",
    entityType: "order_change",
    entityId: changeId,
    details: { reason },
  });

  return { changeId };
}

export async function approveCustomerChange(changeId, reviewerId) {
  const connection = await dbPool.getConnection();

  try {
    await connection.beginTransaction();

    const [changeRows] = await connection.execute(
      `SELECT * FROM customer_changes WHERE id = ? AND status = 'pending' FOR UPDATE`,
      [changeId]
    );

    if (!changeRows.length) {
      const error = new Error("Pending customer request not found");
      error.statusCode = 404;
      throw error;
    }

    const payload = normalizeCustomerPayload(parseJson(changeRows[0].change_data, {}));

    const [insertResult] = await connection.execute(
      `INSERT INTO customers (name, email, phone, company, status)
       VALUES (?, ?, ?, ?, ?)`,
      [payload.name, payload.email, payload.phone, payload.company, payload.status]
    );

    await connection.execute(
      `UPDATE customer_changes
       SET status = 'approved', reviewed_by = ?, reviewed_at = NOW(), customer_id = ?
       WHERE id = ?`,
      [reviewerId, insertResult.insertId, changeId]
    );

    await logAudit({
      userId: reviewerId,
      action: "approve_customer_change",
      entityType: "customer_change",
      entityId: changeId,
      details: {
        customerId: insertResult.insertId,
      },
      connection,
    });

    await connection.commit();

    return {
      changeId,
      customerId: insertResult.insertId,
      changeType: "create",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function rejectCustomerChange(changeId, reviewerId, reason = "") {
  const [result] = await dbPool.execute(
    `UPDATE customer_changes
     SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW(),
         change_data = JSON_SET(COALESCE(change_data, JSON_OBJECT()), '$.rejection_reason', ?)
     WHERE id = ? AND status = 'pending'`,
    [reviewerId, reason, changeId]
  );

  if (!result.affectedRows) {
    const error = new Error("Pending customer request not found");
    error.statusCode = 404;
    throw error;
  }

  await logAudit({
    userId: reviewerId,
    action: "reject_customer_change",
    entityType: "customer_change",
    entityId: changeId,
    details: { reason },
  });

  return { changeId };
}
