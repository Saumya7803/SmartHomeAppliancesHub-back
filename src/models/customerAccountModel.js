import { dbPool } from "../config/db.js";

function mapAccountRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    customer_id: Number(row.customer_id),
    name: row.name,
    company: row.company,
    phone: row.phone,
    email: row.email,
    account_type: row.account_type || "customer",
    status: row.status || "active",
    created_at: row.created_at,
    updated_at: row.updated_at,
    customer_status: row.customer_status || "active",
  };
}

export async function findCustomerAccountByEmail(email) {
  const [rows] = await dbPool.execute(
    `SELECT
       ca.id,
       ca.customer_id,
       ca.name,
       ca.company,
       ca.phone,
       ca.email,
       ca.password,
       ca.account_type,
       ca.status,
       ca.created_at,
       ca.updated_at,
       c.status AS customer_status
     FROM customer_accounts ca
     JOIN customers c ON c.id = ca.customer_id
     WHERE LOWER(ca.email) = LOWER(?)
     LIMIT 1`,
    [email]
  );

  return rows[0] || null;
}

export async function findCustomerAccountById(accountId) {
  const [rows] = await dbPool.execute(
    `SELECT
       ca.id,
       ca.customer_id,
       ca.name,
       ca.company,
       ca.phone,
       ca.email,
       ca.account_type,
       ca.status,
       ca.created_at,
       ca.updated_at,
       c.status AS customer_status
     FROM customer_accounts ca
     JOIN customers c ON c.id = ca.customer_id
     WHERE ca.id = ?
     LIMIT 1`,
    [accountId]
  );

  return mapAccountRow(rows[0] || null);
}

export async function createCustomerAccount(payload) {
  const connection = await dbPool.getConnection();

  try {
    await connection.beginTransaction();

    const [existingAccountRows] = await connection.execute(
      `SELECT id FROM customer_accounts WHERE LOWER(email) = LOWER(?) LIMIT 1`,
      [payload.email]
    );

    if (existingAccountRows.length) {
      await connection.rollback();
      return { duplicate: true };
    }

    const [existingCustomerRows] = await connection.execute(
      `SELECT id FROM customers WHERE LOWER(email) = LOWER(?) LIMIT 1`,
      [payload.email]
    );

    let customerId;

    if (existingCustomerRows.length) {
      customerId = Number(existingCustomerRows[0].id);
      await connection.execute(
        `UPDATE customers
         SET name = ?,
             phone = ?,
             company = ?,
             status = 'active',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [payload.name, payload.phone || null, payload.company || null, customerId]
      );
    } else {
      const [customerResult] = await connection.execute(
        `INSERT INTO customers (name, email, phone, company, status)
         VALUES (?, ?, ?, ?, 'active')`,
        [payload.name, payload.email, payload.phone || null, payload.company || null]
      );
      customerId = Number(customerResult.insertId);
    }

    const [accountResult] = await connection.execute(
      `INSERT INTO customer_accounts
         (customer_id, name, company, phone, email, password, account_type, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        customerId,
        payload.name,
        payload.company || null,
        payload.phone || null,
        payload.email,
        payload.password,
        payload.account_type || "customer",
      ]
    );

    await connection.commit();

    return {
      duplicate: false,
      accountId: Number(accountResult.insertId),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateCustomerAccountById(accountId, payload) {
  const [result] = await dbPool.execute(
    `UPDATE customer_accounts
     SET name = ?,
         company = ?,
         phone = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [payload.name, payload.company || null, payload.phone || null, accountId]
  );

  if (!result.affectedRows) {
    return result;
  }

  await dbPool.execute(
    `UPDATE customers c
     JOIN customer_accounts ca ON ca.customer_id = c.id
     SET c.name = ?,
         c.company = ?,
         c.phone = ?,
         c.updated_at = CURRENT_TIMESTAMP
     WHERE ca.id = ?`,
    [payload.name, payload.company || null, payload.phone || null, accountId]
  );

  return result;
}

export async function listCustomerOrders(accountId) {
  const [rows] = await dbPool.execute(
    `SELECT
       o.id,
       o.order_number,
       o.total_amount,
       o.status,
       o.support_status,
       o.created_at,
       o.updated_at
     FROM orders o
     JOIN customer_accounts ca ON ca.customer_id = o.customer_id
     WHERE ca.id = ?
     ORDER BY o.created_at DESC
     LIMIT 200`,
    [accountId]
  );

  return rows.map((row) => ({
    ...row,
    id: Number(row.id),
    total_amount: Number(row.total_amount || 0),
  }));
}

export async function listCustomerQuotations(accountId) {
  const [rows] = await dbPool.execute(
    `SELECT
       q.id,
       q.quotation_number,
       q.quotation_status,
       q.product_name,
       q.quantity,
       q.total_amount,
       q.valid_until,
       q.created_at,
       q.updated_at
     FROM quotations q
     JOIN customer_accounts ca ON LOWER(ca.email) = LOWER(q.customer_email)
     WHERE ca.id = ?
     ORDER BY q.created_at DESC
     LIMIT 200`,
    [accountId]
  );

  return rows.map((row) => ({
    ...row,
    id: Number(row.id),
    quantity: Number(row.quantity || 0),
    total_amount: Number(row.total_amount || 0),
  }));
}

export async function listCustomerSavedProducts(accountId) {
  const [rows] = await dbPool.execute(
    `SELECT
       p.id,
       p.name,
       p.model,
       p.category,
       p.brand,
       p.price,
       p.image_url,
       sp.created_at AS saved_at
     FROM customer_saved_products sp
     JOIN products p ON p.id = sp.product_id
     WHERE sp.customer_account_id = ?
     ORDER BY sp.created_at DESC
     LIMIT 200`,
    [accountId]
  );

  return rows.map((row) => ({
    ...row,
    id: Number(row.id),
    price: Number(row.price || 0),
  }));
}

export async function saveCustomerProduct(accountId, productId) {
  const [result] = await dbPool.execute(
    `INSERT INTO customer_saved_products (customer_account_id, product_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP`,
    [accountId, productId]
  );

  return result;
}

export async function removeCustomerProduct(accountId, productId) {
  const [result] = await dbPool.execute(
    `DELETE FROM customer_saved_products
     WHERE customer_account_id = ? AND product_id = ?`,
    [accountId, productId]
  );

  return result;
}
