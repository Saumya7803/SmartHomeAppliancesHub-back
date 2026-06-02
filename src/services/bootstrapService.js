import { dbPool } from "../config/db.js";
import { env } from "../config/env.js";
import { hashPassword } from "../utils/password.js";
import { USER_ROLES } from "../utils/roles.js";

const DEFAULT_BRANDS = ["LG", "Samsung", "Haier", "Voltas", "IFB", "Symphony", "Bajaj"];
const DEFAULT_CATEGORIES = [
  "Refrigerator",
  "Air Conditioner",
  "Air Cooler",
  "Washing Machine",
  "Microwave",
  "TV",
];
const DEFAULT_PRODUCTS = [
  {
    name: "Sony Bravia Pro Display 55-inch",
    category: "TV",
    brand: "Sony",
    model: "SBP-55X900",
    price: 74990,
    stockQuantity: 8,
    description: "4K professional display built for continuous operation with vibrant color accuracy.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e2/LG_smart_TV.jpg",
    specifications: {
      "Display Size": "55 inches",
      Resolution: "3840 x 2160 (4K UHD)",
      "Panel Type": "LED",
      Connectivity: "HDMI x3, USB x2, LAN",
    },
  },
  {
    name: "Samsung UHD Commercial TV 50-inch",
    category: "TV",
    brand: "Samsung",
    model: "SMC-50U7",
    price: 69990,
    stockQuantity: 10,
    description: "Industrial-ready UHD television optimized for long-hour commercial presentation.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/91/1990s_Television_Set.jpg",
    specifications: {
      "Display Size": "50 inches",
      Resolution: "3840 x 2160 (4K UHD)",
      Brightness: "350 nits",
      Connectivity: "HDMI x2, USB x1",
    },
  },
  {
    name: "LG Digital Signage TV 43-inch",
    category: "TV",
    brand: "LG",
    model: "LGS-43D",
    price: 52990,
    stockQuantity: 12,
    description: "Commercial signage display with stable playback and easy wall integration.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d1/19%22_Sylvania_CRT_television_with_Logitech_Harmony_remote.jpg",
    specifications: {
      "Display Size": "43 inches",
      Resolution: "1920 x 1080 (Full HD)",
      "Viewing Angle": "178 degrees",
      Connectivity: "HDMI x2, USB x2, LAN",
    },
  },
  {
    name: "Panasonic ProVision Display 65-inch",
    category: "TV",
    brand: "Panasonic",
    model: "PVP-65C",
    price: 89990,
    stockQuantity: 6,
    description: "Large format business television with high contrast and secure connectivity.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d8/19%22_Crosley_television_set_with_NES.jpg",
    specifications: {
      "Display Size": "65 inches",
      Resolution: "3840 x 2160 (4K UHD)",
      "Response Time": "8 ms",
      Connectivity: "HDMI x3, USB x2, LAN",
    },
  },
  {
    name: "LG Dual Inverter Split AC",
    category: "Air Conditioner",
    brand: "LG",
    model: "LG-AC-1.5T",
    price: 46990,
    stockQuantity: 18,
    description: "Dual inverter split AC for efficient and stable room cooling.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Air_Conditioner_for_a_single_room.jpg",
    specifications: {
      Capacity: "1.5 Ton",
      Compressor: "Dual Inverter",
      Type: "Split AC",
    },
  },
  {
    name: "Voltas Window AC",
    category: "Air Conditioner",
    brand: "Voltas",
    model: "VOL-WIN-AC-1.5T",
    price: 42990,
    stockQuantity: 15,
    description: "Window AC built for consistent cooling in office and small commercial spaces.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Air_conditioner_14.jpg",
    specifications: {
      Capacity: "1.5 Ton",
      Type: "Window AC",
    },
  },
  {
    name: "Bajaj Personal Air Cooler",
    category: "Air Cooler",
    brand: "Bajaj",
    model: "BAJ-ACOOL-PERS",
    price: 8990,
    stockQuantity: 26,
    description: "Compact personal cooler suitable for bedrooms and small offices.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/56/Crompton_Desert_Air_Cooler.jpg",
    specifications: {
      Type: "Personal Cooler",
      Coverage: "Small Room",
    },
  },
  {
    name: "IFB Solo Microwave",
    category: "Microwave",
    brand: "IFB",
    model: "IFB-MW-SOLO",
    price: 9990,
    stockQuantity: 16,
    description: "Solo microwave oven for everyday heating and defrosting needs.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ef/LG_Microwave_oven.jpg",
    specifications: {
      Capacity: "23 Litre",
      Type: "Solo",
    },
  },
  {
    name: "LG Double Door Refrigerator",
    category: "Refrigerator",
    brand: "LG",
    model: "LG-REF-DD",
    price: 32990,
    stockQuantity: 12,
    description: "Double door refrigerator with inverter compressor and fast cooling.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/61/Panasonic_HOME_REFRIGERATOR_NR-C320WP-N.jpg",
    specifications: {
      Capacity: "260 Litre",
      Type: "Double Door",
    },
  },
  {
    name: "LG Front Load Washing Machine",
    category: "Washing Machine",
    brand: "LG",
    model: "LG-WM-FL",
    price: 28990,
    stockQuantity: 10,
    description: "Front load washing machine with smart wash programs and low noise.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Washing_Machine_Beko.jpg",
    specifications: {
      Capacity: "7 Kg",
      Type: "Front Load",
    },
  },
];
const DEFAULT_FEATURE_FLAGS = [
  {
    flagKey: "maintenance_banner",
    label: "Maintenance Banner",
    description: "Show a maintenance banner across admin surfaces.",
    enabled: false,
  },
  {
    flagKey: "extended_audit_logs",
    label: "Extended Audit Logs",
    description: "Capture extended request diagnostics for debugging.",
    enabled: true,
  },
  {
    flagKey: "beta_product_editor",
    label: "Beta Product Editor",
    description: "Enable the experimental product editor workflow.",
    enabled: false,
  },
];

function normalizeLookupKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

async function ensureProductColumn(columnName, definition) {
  const [rows] = await dbPool.execute(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = ?
     LIMIT 1`,
    [env.mysql.database, columnName]
  );
  if (!rows.length) {
    await dbPool.execute(`ALTER TABLE products ADD COLUMN ${definition}`);
  }
}

async function ensureEnquiryColumn(columnName, definition) {
  const [rows] = await dbPool.execute(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'enquiries' AND COLUMN_NAME = ?
     LIMIT 1`,
    [env.mysql.database, columnName]
  );
  if (!rows.length) {
    await dbPool.execute(`ALTER TABLE enquiries ADD COLUMN ${definition}`);
  }
}

async function ensureQuotationColumn(columnName, definition) {
  const [rows] = await dbPool.execute(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'quotations' AND COLUMN_NAME = ?
     LIMIT 1`,
    [env.mysql.database, columnName]
  );
  if (!rows.length) {
    await dbPool.execute(`ALTER TABLE quotations ADD COLUMN ${definition}`);
  }
}

async function ensureUserColumn(columnName, definition) {
  const [rows] = await dbPool.execute(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = ?
     LIMIT 1`,
    [env.mysql.database, columnName]
  );
  if (!rows.length) {
    await dbPool.execute(`ALTER TABLE users ADD COLUMN ${definition}`);
  }
}

async function ensureTableIndex(tableName, indexName, definition) {
  const [rows] = await dbPool.execute(
    `SELECT INDEX_NAME
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?
     LIMIT 1`,
    [env.mysql.database, tableName, indexName]
  );

  if (!rows.length) {
    await dbPool.execute(`ALTER TABLE ${tableName} ADD INDEX ${definition}`);
  }
}

async function ensureForeignKeyConstraint(tableName, constraintName, definition) {
  const [rows] = await dbPool.execute(
    `SELECT CONSTRAINT_NAME
     FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_TYPE = 'FOREIGN KEY' AND CONSTRAINT_NAME = ?
     LIMIT 1`,
    [env.mysql.database, tableName, constraintName]
  );

  if (!rows.length) {
    await dbPool.execute(`ALTER TABLE ${tableName} ADD CONSTRAINT ${definition}`);
  }
}

async function ensureCategoriesTable() {
  await dbPool.execute(
    `CREATE TABLE IF NOT EXISTS categories (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(120) NOT NULL UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  );
}

async function ensureUsersTable() {
  await dbPool.execute(
    `CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('super_admin', 'admin', 'development_team', 'operator', 'sales') NOT NULL DEFAULT 'operator',
      status ENUM('active', 'suspended', 'disabled') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`
  );
}

async function ensureCustomersTable() {
  await dbPool.execute(
    `CREATE TABLE IF NOT EXISTS customers (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      phone VARCHAR(30) NULL,
      company VARCHAR(160) NULL,
      status ENUM('lead', 'active', 'inactive') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`
  );
}

async function ensureProductsTable() {
  await dbPool.execute(
    `CREATE TABLE IF NOT EXISTS products (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(180) NOT NULL,
      model VARCHAR(120) NOT NULL,
      category_id BIGINT UNSIGNED NULL,
      brand_id BIGINT UNSIGNED NULL,
      category VARCHAR(100) NOT NULL,
      brand VARCHAR(100) NOT NULL,
      price DECIMAL(12, 2) NOT NULL DEFAULT 0,
      stock_quantity INT UNSIGNED NOT NULL DEFAULT 0,
      description TEXT NOT NULL,
      specifications JSON NULL,
      image_url LONGTEXT NULL,
      brochure_url LONGTEXT NULL,
      status ENUM('approved', 'pending', 'rejected') NOT NULL DEFAULT 'approved',
      is_published TINYINT(1) NOT NULL DEFAULT 1,
      created_by BIGINT UNSIGNED NULL,
      updated_by BIGINT UNSIGNED NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_products_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      CONSTRAINT fk_products_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_products_status (status),
      INDEX idx_products_published (is_published),
      INDEX idx_products_category_id (category_id),
      INDEX idx_products_brand_id (brand_id)
    )`
  );
}

async function ensureCustomerSavedProductsTable() {
  await dbPool.execute(
    `CREATE TABLE IF NOT EXISTS customer_saved_products (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      customer_account_id BIGINT UNSIGNED NOT NULL,
      product_id BIGINT UNSIGNED NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_customer_saved_products_account FOREIGN KEY (customer_account_id) REFERENCES customer_accounts(id) ON DELETE CASCADE,
      CONSTRAINT fk_customer_saved_products_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE KEY uq_customer_saved_product (customer_account_id, product_id)
    )`
  );
}

async function ensureOrdersTable() {
  await dbPool.execute(
    `CREATE TABLE IF NOT EXISTS orders (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      customer_id BIGINT UNSIGNED NOT NULL,
      order_number VARCHAR(40) NOT NULL UNIQUE,
      total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
      status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
      support_status ENUM('open', 'in_progress', 'resolved') NOT NULL DEFAULT 'open',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    )`
  );
}

async function ensureInvoicesTable() {
  await dbPool.execute(
    `CREATE TABLE IF NOT EXISTS invoices (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      invoice_number VARCHAR(40) NOT NULL UNIQUE,
      customer_id BIGINT UNSIGNED NOT NULL,
      order_id BIGINT UNSIGNED NULL,
      total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
      status ENUM('draft', 'issued', 'paid', 'overdue') NOT NULL DEFAULT 'issued',
      issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      due_date DATE NULL,
      created_by BIGINT UNSIGNED NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_invoices_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
      CONSTRAINT fk_invoices_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
      CONSTRAINT fk_invoices_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_invoices_status (status),
      INDEX idx_invoices_issued_at (issued_at)
    )`
  );
}

async function ensureCustomerAccountsTable() {
  await dbPool.execute(
    `CREATE TABLE IF NOT EXISTS customer_accounts (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      customer_id BIGINT UNSIGNED NOT NULL UNIQUE,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      phone VARCHAR(30) NULL,
      company VARCHAR(160) NULL,
      password VARCHAR(255) NOT NULL,
      account_type ENUM('customer', 'dealer', 'distributor') NOT NULL DEFAULT 'customer',
      status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_customer_accounts_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
      INDEX idx_customer_accounts_type (account_type)
    )`
  );
}

async function ensureEnquiriesTable() {
  await dbPool.execute(
    `CREATE TABLE IF NOT EXISTS enquiries (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      enquiry_code VARCHAR(40) NULL UNIQUE,
      customer_name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL,
      phone VARCHAR(40) NOT NULL,
      product_id BIGINT UNSIGNED NULL,
      product_name VARCHAR(180) NOT NULL,
      quantity INT UNSIGNED NOT NULL DEFAULT 1,
      message TEXT NULL,
      status ENUM('new', 'contacted', 'quoted', 'closed') NOT NULL DEFAULT 'new',
      source ENUM('website', 'admin', 'manual') NOT NULL DEFAULT 'website',
      assigned_to BIGINT UNSIGNED NULL,
      contacted_at TIMESTAMP NULL,
      quoted_at TIMESTAMP NULL,
      closed_at TIMESTAMP NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_enquiries_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
      CONSTRAINT fk_enquiries_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_enquiries_status (status),
      INDEX idx_enquiries_created_at (created_at),
      INDEX idx_enquiries_assigned_to (assigned_to)
    )`
  );
}

async function ensureQuotationsTable() {
  await dbPool.execute(
    `CREATE TABLE IF NOT EXISTS quotations (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      enquiry_id BIGINT UNSIGNED NOT NULL,
      quotation_number VARCHAR(40) NULL UNIQUE,
      quotation_status ENUM('draft', 'pending_approval', 'approved', 'sent', 'expired', 'rejected') NOT NULL DEFAULT 'pending_approval',
      customer_name VARCHAR(120) NOT NULL,
      customer_email VARCHAR(190) NOT NULL,
      customer_phone VARCHAR(40) NULL,
      product_id BIGINT UNSIGNED NULL,
      product_name VARCHAR(180) NOT NULL,
      unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
      quantity INT UNSIGNED NOT NULL DEFAULT 1,
      discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
      subtotal_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
      discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
      total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
      valid_until DATE NOT NULL,
      notes TEXT NULL,
      created_by BIGINT UNSIGNED NULL,
      approved_by BIGINT UNSIGNED NULL,
      approved_at TIMESTAMP NULL,
      sent_by BIGINT UNSIGNED NULL,
      sent_at TIMESTAMP NULL,
      email_subject VARCHAR(220) NULL,
      email_body TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_quotations_enquiry FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE,
      CONSTRAINT fk_quotations_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
      CONSTRAINT fk_quotations_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      CONSTRAINT fk_quotations_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
      CONSTRAINT fk_quotations_sent_by FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_quotations_status (quotation_status),
      INDEX idx_quotations_valid_until (valid_until),
      INDEX idx_quotations_created_at (created_at)
    )`
  );
}

async function ensureProductChangesTable() {
  await dbPool.execute(
    `CREATE TABLE IF NOT EXISTS product_changes (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      product_id BIGINT UNSIGNED NULL,
      change_type ENUM('create', 'update', 'delete') NOT NULL,
      change_data JSON NULL,
      requested_by BIGINT UNSIGNED NOT NULL,
      status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
      reviewed_by BIGINT UNSIGNED NULL,
      reviewed_at TIMESTAMP NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_product_changes_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      CONSTRAINT fk_product_changes_requested_by FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_product_changes_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
    )`
  );
}

async function ensureOrderChangesTable() {
  await dbPool.execute(
    `CREATE TABLE IF NOT EXISTS order_changes (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      order_id BIGINT UNSIGNED NULL,
      change_type ENUM('create') NOT NULL,
      change_data JSON NULL,
      requested_by BIGINT UNSIGNED NOT NULL,
      status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
      reviewed_by BIGINT UNSIGNED NULL,
      reviewed_at TIMESTAMP NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_order_changes_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
      CONSTRAINT fk_order_changes_requested_by FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_order_changes_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_order_changes_status (status)
    )`
  );
}

async function ensureCustomerChangesTable() {
  await dbPool.execute(
    `CREATE TABLE IF NOT EXISTS customer_changes (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      customer_id BIGINT UNSIGNED NULL,
      change_type ENUM('create') NOT NULL,
      change_data JSON NULL,
      requested_by BIGINT UNSIGNED NOT NULL,
      status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
      reviewed_by BIGINT UNSIGNED NULL,
      reviewed_at TIMESTAMP NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_customer_changes_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
      CONSTRAINT fk_customer_changes_requested_by FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_customer_changes_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_customer_changes_status (status)
    )`
  );
}

async function ensureAuditLogsTable() {
  await dbPool.execute(
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NULL,
      action VARCHAR(120) NOT NULL,
      entity_type VARCHAR(80) NOT NULL,
      entity_id BIGINT UNSIGNED NULL,
      details JSON NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_audit_logs_created_at (created_at)
    )`
  );
}

async function upsertDefaultUser({ name, email, password, role }) {
  const passwordHash = await hashPassword(password);

  await dbPool.execute(
    `INSERT INTO users (name, email, password, role)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       password = VALUES(password),
       role = VALUES(role)`,
    [name, email, passwordHash, role]
  );
}

async function ensureFeatureFlagsTable() {
  await dbPool.execute(
    `CREATE TABLE IF NOT EXISTS feature_flags (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      flag_key VARCHAR(120) NOT NULL UNIQUE,
      label VARCHAR(160) NOT NULL,
      description TEXT NULL,
      is_enabled TINYINT(1) NOT NULL DEFAULT 0,
      updated_by BIGINT UNSIGNED NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_feature_flags_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_feature_flags_enabled (is_enabled)
    )`
  );

  for (const flag of DEFAULT_FEATURE_FLAGS) {
    await dbPool.execute(
      `INSERT INTO feature_flags (flag_key, label, description, is_enabled)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         label = VALUES(label),
         description = VALUES(description)`,
      [flag.flagKey, flag.label, flag.description, Number(flag.enabled)]
    );
  }
}

async function ensureSystemSettingsTable() {
  await dbPool.execute(
    `CREATE TABLE IF NOT EXISTS system_settings (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      setting_key VARCHAR(120) NOT NULL UNIQUE,
      setting_value JSON NOT NULL,
      updated_by BIGINT UNSIGNED NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_system_settings_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
    )`
  );

  const defaultSettings = [
    ["payment_currency", "INR"],
    ["payment_gateway_mode", "sandbox"],
    ["payment_auto_capture", true],
    ["payment_retry_window_minutes", 15],
  ];

  for (const [settingKey, settingValue] of defaultSettings) {
    await dbPool.execute(
      `INSERT INTO system_settings (setting_key, setting_value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = setting_value`,
      [settingKey, JSON.stringify(settingValue)]
    );
  }
}

async function ensureApiKeysTable() {
  await dbPool.execute(
    `CREATE TABLE IF NOT EXISTS api_keys (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      key_name VARCHAR(120) NOT NULL,
      key_prefix VARCHAR(40) NOT NULL,
      key_hash CHAR(64) NOT NULL UNIQUE,
      role_scope ENUM('super_admin', 'admin', 'development_team', 'operator', 'sales', 'read_only') NOT NULL DEFAULT 'read_only',
      created_by BIGINT UNSIGNED NULL,
      revoked_at TIMESTAMP NULL,
      last_used_at TIMESTAMP NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_api_keys_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_api_keys_role_scope (role_scope),
      INDEX idx_api_keys_revoked_at (revoked_at)
    )`
  );
}

async function ensureProductSeedCategory(categoryName) {
  const [result] = await dbPool.execute(
    `INSERT INTO categories (name)
     VALUES (?)
     ON DUPLICATE KEY UPDATE
       id = LAST_INSERT_ID(id),
       name = VALUES(name)`,
    [categoryName]
  );

  return Number(result.insertId);
}

async function ensureProductSeedBrand(brandName) {
  const [existingRows] = await dbPool.execute(
    `SELECT id
     FROM brands
     WHERE LOWER(name) = LOWER(?)
     LIMIT 1`,
    [brandName]
  );

  if (existingRows.length) {
    return Number(existingRows[0].id);
  }

  const slugBase = slugifyBrandName(brandName);
  const uniqueSlug = await buildUniqueBrandSlug(slugBase);
  const [result] = await dbPool.execute(
    `INSERT INTO brands (name, slug, logo, description)
     VALUES (?, ?, NULL, NULL)`,
    [brandName, uniqueSlug]
  );

  return Number(result.insertId);
}

async function ensureDefaultProducts(seedActorId = null) {
  const [categoryRows] = await dbPool.execute(`SELECT id, name FROM categories`);
  const [brandRows] = await dbPool.execute(`SELECT id, name FROM brands`);

  const categoryIdByName = new Map(
    categoryRows.map((row) => [normalizeLookupKey(row.name), Number(row.id)])
  );
  const brandIdByName = new Map(
    brandRows.map((row) => [normalizeLookupKey(row.name), Number(row.id)])
  );

  for (const product of DEFAULT_PRODUCTS) {
    const normalizedCategoryKey = normalizeLookupKey(product.category);
    const normalizedBrandKey = normalizeLookupKey(product.brand);

    let categoryId = categoryIdByName.get(normalizedCategoryKey) || null;
    if (!categoryId) {
      categoryId = await ensureProductSeedCategory(product.category);
      categoryIdByName.set(normalizedCategoryKey, categoryId);
    }

    let brandId = brandIdByName.get(normalizedBrandKey) || null;
    if (!brandId) {
      brandId = await ensureProductSeedBrand(product.brand);
      brandIdByName.set(normalizedBrandKey, brandId);
    }

    const [existingRows] = await dbPool.execute(
      `SELECT id
       FROM products
       WHERE model = ?
       LIMIT 1`,
      [product.model]
    );

    if (existingRows.length) {
      await dbPool.execute(
        `UPDATE products
         SET name = ?,
             category_id = ?,
             brand_id = ?,
             category = ?,
             brand = ?,
             price = ?,
             stock_quantity = ?,
             description = ?,
             specifications = ?,
             image_url = ?,
             status = 'approved',
             is_published = 1,
             updated_by = ?
         WHERE id = ?`,
        [
          product.name,
          categoryId,
          brandId,
          product.category,
          product.brand,
          Number(product.price),
          Number(product.stockQuantity),
          product.description,
          JSON.stringify(product.specifications || {}),
          product.imageUrl || null,
          seedActorId,
          Number(existingRows[0].id),
        ]
      );
      continue;
    }

    await dbPool.execute(
      `INSERT INTO products (
         name, model, category_id, brand_id, category, brand, price, stock_quantity,
         description, specifications, image_url, status, is_published, created_by, updated_by
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', 1, ?, ?)`,
      [
        product.name,
        product.model,
        categoryId,
        brandId,
        product.category,
        product.brand,
        Number(product.price),
        Number(product.stockQuantity),
        product.description,
        JSON.stringify(product.specifications || {}),
        product.imageUrl || null,
        seedActorId,
        seedActorId,
      ]
    );
  }
}

async function ensureCategoryReferencesFromProducts() {
  await dbPool.execute(
    `INSERT INTO categories (name)
     SELECT DISTINCT TRIM(category) AS name
     FROM products
     WHERE category IS NOT NULL AND TRIM(category) <> ''
     ON DUPLICATE KEY UPDATE name = VALUES(name)`
  );
}

async function isBrandSlugTaken(slug) {
  const [rows] = await dbPool.execute(`SELECT id FROM brands WHERE slug = ? LIMIT 1`, [slug]);
  return rows.length > 0;
}

async function buildUniqueBrandSlug(baseSlug) {
  const normalizedBase = baseSlug || `brand-${Date.now()}`;
  let candidate = normalizedBase;
  let suffix = 2;

  while (await isBrandSlugTaken(candidate)) {
    candidate = `${normalizedBase}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function ensureBrandReferencesFromProducts() {
  const [rows] = await dbPool.execute(
    `SELECT DISTINCT TRIM(brand) AS name
     FROM products
     WHERE brand IS NOT NULL AND TRIM(brand) <> ''`
  );

  for (const row of rows) {
    const brandName = String(row.name || "").trim();
    if (!brandName) {
      continue;
    }

    const [existingRows] = await dbPool.execute(
      `SELECT id FROM brands WHERE LOWER(name) = LOWER(?) LIMIT 1`,
      [brandName]
    );
    if (existingRows.length) {
      continue;
    }

    const uniqueSlug = await buildUniqueBrandSlug(slugifyBrandName(brandName));
    await dbPool.execute(
      `INSERT INTO brands (name, slug, logo, description)
       VALUES (?, ?, NULL, NULL)`,
      [brandName, uniqueSlug]
    );
  }
}

async function backfillProductReferenceIds() {
  await dbPool.execute(
    `UPDATE products p
     JOIN categories c ON LOWER(TRIM(p.category)) = LOWER(c.name)
     SET p.category_id = c.id
     WHERE p.category_id IS NULL AND p.category IS NOT NULL AND TRIM(p.category) <> ''`
  );

  await dbPool.execute(
    `UPDATE products p
     JOIN brands b ON LOWER(TRIM(p.brand)) = LOWER(b.name)
     SET p.brand_id = b.id
     WHERE p.brand_id IS NULL AND p.brand IS NOT NULL AND TRIM(p.brand) <> ''`
  );
}

async function syncProductReferenceNames() {
  await dbPool.execute(
    `UPDATE products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN brands b ON b.id = p.brand_id
     SET p.category = COALESCE(c.name, p.category),
         p.brand = COALESCE(b.name, p.brand)
     WHERE p.category_id IS NOT NULL OR p.brand_id IS NOT NULL`
  );
}

async function removeInvalidProductReferenceIds() {
  await dbPool.execute(
    `UPDATE products p
     LEFT JOIN categories c ON c.id = p.category_id
     SET p.category_id = NULL
     WHERE p.category_id IS NOT NULL AND c.id IS NULL`
  );

  await dbPool.execute(
    `UPDATE products p
     LEFT JOIN brands b ON b.id = p.brand_id
     SET p.brand_id = NULL
     WHERE p.brand_id IS NOT NULL AND b.id IS NULL`
  );
}

async function ensureProductReferenceSchema() {
  await ensureProductColumn("category_id", "category_id BIGINT UNSIGNED NULL AFTER model");
  await ensureProductColumn("brand_id", "brand_id BIGINT UNSIGNED NULL AFTER category_id");
  await ensureCategoryReferencesFromProducts();
  await ensureBrandReferencesFromProducts();
  await backfillProductReferenceIds();
  await syncProductReferenceNames();
  await removeInvalidProductReferenceIds();
  await ensureTableIndex("products", "idx_products_category_id", "idx_products_category_id (category_id)");
  await ensureTableIndex("products", "idx_products_brand_id", "idx_products_brand_id (brand_id)");
  await ensureForeignKeyConstraint(
    "products",
    "fk_products_category",
    "fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL"
  );
  await ensureForeignKeyConstraint(
    "products",
    "fk_products_brand",
    "fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL"
  );
}

async function backfillEnquiryCodes() {
  await dbPool.execute(
    `UPDATE enquiries
     SET enquiry_code = CONCAT('ENQ-', LPAD(id, 6, '0'))
     WHERE enquiry_code IS NULL OR TRIM(enquiry_code) = ''`
  );
}

async function ensureAccessControlSchema() {
  await ensureUsersTable();
  await ensureCustomersTable();
  await ensureCustomerAccountsTable();
  await ensureCategoryCatalog();
  await ensureBrandCatalog();
  await ensureProductsTable();
  await ensureCustomerSavedProductsTable();
  await ensureOrdersTable();
  await ensureInvoicesTable();
  await ensureEnquiriesTable();
  await ensureQuotationsTable();
  await ensureProductChangesTable();
  await ensureOrderChangesTable();
  await ensureCustomerChangesTable();
  await ensureAuditLogsTable();
  await dbPool.execute(
    `ALTER TABLE users
     MODIFY role ENUM('super_admin', 'admin', 'development_team', 'operator', 'sales', 'user') NOT NULL DEFAULT 'operator'`
  );
  await dbPool.execute(`UPDATE users SET role = 'operator' WHERE role = 'user'`);
  await dbPool.execute(
    `ALTER TABLE users
     MODIFY role ENUM('super_admin', 'admin', 'development_team', 'operator', 'sales') NOT NULL DEFAULT 'operator'`
  );
  await ensureUserColumn(
    "status",
    "status ENUM('active', 'suspended', 'disabled') NOT NULL DEFAULT 'active' AFTER role"
  );
  await ensureUserColumn(
    "updated_at",
    "updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at"
  );
  await dbPool.execute(`UPDATE users SET status = 'active' WHERE status IS NULL`);
  await dbPool.execute(
    `ALTER TABLE users
     MODIFY status ENUM('active', 'suspended', 'disabled') NOT NULL DEFAULT 'active'`
  );
  await dbPool.execute(`ALTER TABLE products MODIFY image_url LONGTEXT NULL`);
  await ensureProductColumn("price", "price DECIMAL(12, 2) NOT NULL DEFAULT 0 AFTER brand");
  await ensureProductColumn("stock_quantity", "stock_quantity INT UNSIGNED NOT NULL DEFAULT 0 AFTER price");
  await ensureProductColumn("brochure_url", "brochure_url LONGTEXT NULL AFTER image_url");
  await ensureEnquiryColumn("enquiry_code", "enquiry_code VARCHAR(40) NULL AFTER id");
  await ensureEnquiryColumn("customer_name", "customer_name VARCHAR(120) NOT NULL DEFAULT '' AFTER enquiry_code");
  await ensureEnquiryColumn(
    "email",
    "email VARCHAR(190) NOT NULL DEFAULT '' AFTER customer_name"
  );
  await ensureEnquiryColumn("phone", "phone VARCHAR(40) NOT NULL DEFAULT '' AFTER email");
  await ensureEnquiryColumn("product_id", "product_id BIGINT UNSIGNED NULL AFTER phone");
  await ensureEnquiryColumn(
    "product_name",
    "product_name VARCHAR(180) NOT NULL DEFAULT '' AFTER product_id"
  );
  await ensureEnquiryColumn("quantity", "quantity INT UNSIGNED NOT NULL DEFAULT 1 AFTER product_name");
  await ensureEnquiryColumn("message", "message TEXT NULL AFTER quantity");
  await ensureEnquiryColumn(
    "status",
    "status ENUM('new', 'contacted', 'quoted', 'closed') NOT NULL DEFAULT 'new' AFTER message"
  );
  await ensureEnquiryColumn(
    "source",
    "source ENUM('website', 'admin', 'manual') NOT NULL DEFAULT 'website' AFTER status"
  );
  await ensureEnquiryColumn("assigned_to", "assigned_to BIGINT UNSIGNED NULL AFTER source");
  await ensureEnquiryColumn("contacted_at", "contacted_at TIMESTAMP NULL AFTER assigned_to");
  await ensureEnquiryColumn("quoted_at", "quoted_at TIMESTAMP NULL AFTER contacted_at");
  await ensureEnquiryColumn("closed_at", "closed_at TIMESTAMP NULL AFTER quoted_at");
  await ensureEnquiryColumn(
    "created_at",
    "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER closed_at"
  );
  await ensureEnquiryColumn(
    "updated_at",
    "updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at"
  );
  await ensureQuotationColumn("quotation_number", "quotation_number VARCHAR(40) NULL UNIQUE AFTER enquiry_id");
  await ensureQuotationColumn(
    "quotation_status",
    "quotation_status ENUM('draft', 'pending_approval', 'approved', 'sent', 'expired', 'rejected') NOT NULL DEFAULT 'pending_approval' AFTER quotation_number"
  );
  await ensureQuotationColumn("customer_name", "customer_name VARCHAR(120) NOT NULL DEFAULT '' AFTER quotation_status");
  await ensureQuotationColumn(
    "customer_email",
    "customer_email VARCHAR(190) NOT NULL DEFAULT '' AFTER customer_name"
  );
  await ensureQuotationColumn("customer_phone", "customer_phone VARCHAR(40) NULL AFTER customer_email");
  await ensureQuotationColumn("product_id", "product_id BIGINT UNSIGNED NULL AFTER customer_phone");
  await ensureQuotationColumn("product_name", "product_name VARCHAR(180) NOT NULL DEFAULT '' AFTER product_id");
  await ensureQuotationColumn("unit_price", "unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0 AFTER product_name");
  await ensureQuotationColumn("quantity", "quantity INT UNSIGNED NOT NULL DEFAULT 1 AFTER unit_price");
  await ensureQuotationColumn(
    "discount_percent",
    "discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 0 AFTER quantity"
  );
  await ensureQuotationColumn(
    "subtotal_amount",
    "subtotal_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 AFTER discount_percent"
  );
  await ensureQuotationColumn(
    "discount_amount",
    "discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 AFTER subtotal_amount"
  );
  await ensureQuotationColumn("total_amount", "total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 AFTER discount_amount");
  await ensureQuotationColumn("valid_until", "valid_until DATE NULL AFTER total_amount");
  await ensureQuotationColumn("notes", "notes TEXT NULL AFTER valid_until");
  await ensureQuotationColumn("created_by", "created_by BIGINT UNSIGNED NULL AFTER notes");
  await ensureQuotationColumn("approved_by", "approved_by BIGINT UNSIGNED NULL AFTER created_by");
  await ensureQuotationColumn("approved_at", "approved_at TIMESTAMP NULL AFTER approved_by");
  await ensureQuotationColumn("sent_by", "sent_by BIGINT UNSIGNED NULL AFTER approved_at");
  await ensureQuotationColumn("sent_at", "sent_at TIMESTAMP NULL AFTER sent_by");
  await ensureQuotationColumn("email_subject", "email_subject VARCHAR(220) NULL AFTER sent_at");
  await ensureQuotationColumn("email_body", "email_body TEXT NULL AFTER email_subject");
  await ensureQuotationColumn(
    "created_at",
    "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER email_body"
  );
  await ensureQuotationColumn(
    "updated_at",
    "updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at"
  );
  await backfillEnquiryCodes();
  await ensureTableIndex("enquiries", "idx_enquiries_code", "idx_enquiries_code (enquiry_code)");
  await ensureTableIndex("enquiries", "idx_enquiries_status", "idx_enquiries_status (status)");
  await ensureTableIndex("enquiries", "idx_enquiries_created_at", "idx_enquiries_created_at (created_at)");
  await ensureTableIndex("enquiries", "idx_enquiries_assigned_to", "idx_enquiries_assigned_to (assigned_to)");
  await ensureTableIndex("quotations", "idx_quotations_status", "idx_quotations_status (quotation_status)");
  await ensureTableIndex(
    "quotations",
    "idx_quotations_valid_until",
    "idx_quotations_valid_until (valid_until)"
  );
  await ensureTableIndex(
    "quotations",
    "idx_quotations_created_at",
    "idx_quotations_created_at (created_at)"
  );
  await ensureForeignKeyConstraint(
    "enquiries",
    "fk_enquiries_assigned_to",
    "fk_enquiries_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL"
  );
  await ensureForeignKeyConstraint(
    "enquiries",
    "fk_enquiries_product",
    "fk_enquiries_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL"
  );
  await ensureForeignKeyConstraint(
    "quotations",
    "fk_quotations_approved_by",
    "fk_quotations_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL"
  );
  await ensureForeignKeyConstraint(
    "quotations",
    "fk_quotations_sent_by",
    "fk_quotations_sent_by FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL"
  );
  await ensureProductReferenceSchema();
  await ensureFeatureFlagsTable();
  await ensureSystemSettingsTable();
  await ensureApiKeysTable();
  await dbPool.execute(
    `ALTER TABLE api_keys
     MODIFY role_scope ENUM('super_admin', 'admin', 'development_team', 'operator', 'sales', 'read_only') NOT NULL DEFAULT 'read_only'`
  );
}

export async function ensureDefaultUsers() {
  await ensureAccessControlSchema();

  if (!env.seedUsers.enabled) {
    return;
  }

  await upsertDefaultUser({ ...env.seedUsers.superAdmin, role: USER_ROLES.SUPER_ADMIN });
  await upsertDefaultUser({ ...env.seedUsers.admin, role: USER_ROLES.ADMIN });
  await upsertDefaultUser({ ...env.seedUsers.developmentTeam, role: USER_ROLES.DEVELOPMENT_TEAM });
  await upsertDefaultUser({ ...env.seedUsers.operator, role: USER_ROLES.OPERATOR });
  await upsertDefaultUser({ ...env.seedUsers.sales, role: USER_ROLES.SALES });

  const [seedActorRows] = await dbPool.execute(
    `SELECT id
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [env.seedUsers.superAdmin.email]
  );
  const seedActorId = seedActorRows.length ? Number(seedActorRows[0].id) : null;

  await ensureDefaultProducts(seedActorId);

  const defaultCustomers = [
    {
      name: "Apex Retail",
      email: "ops@apexretail.com",
      phone: "+91-9000000001",
      company: "Apex Retail",
      status: "active",
    },
    {
      name: "Blue Horizon Hotels",
      email: "procurement@bluehorizon.com",
      phone: "+91-9000000002",
      company: "Blue Horizon Hotels",
      status: "active",
    },
    {
      name: "Metro Residency",
      email: "facilities@metroresidency.com",
      phone: "+91-9000000003",
      company: "Metro Residency",
      status: "lead",
    },
  ];

  for (const customer of defaultCustomers) {
    await dbPool.execute(
      `INSERT INTO customers (name, email, phone, company, status)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         phone = VALUES(phone),
         company = VALUES(company),
         status = VALUES(status)`,
      [customer.name, customer.email, customer.phone, customer.company, customer.status]
    );
  }

  const defaultOrders = [
    ["ops@apexretail.com", "ORD-1001", 129999, "confirmed", "open"],
    ["procurement@bluehorizon.com", "ORD-1002", 84500, "shipped", "in_progress"],
    ["facilities@metroresidency.com", "ORD-1003", 152400, "delivered", "resolved"],
  ];

  for (const [customerEmail, orderNumber, totalAmount, status, supportStatus] of defaultOrders) {
    await dbPool.execute(
      `INSERT INTO orders (customer_id, order_number, total_amount, status, support_status)
       SELECT id, ?, ?, ?, ? FROM customers WHERE email = ?
       ON DUPLICATE KEY UPDATE
         total_amount = VALUES(total_amount),
         status = VALUES(status),
         support_status = VALUES(support_status)`,
      [orderNumber, totalAmount, status, supportStatus, customerEmail]
    );
  }

  const defaultInvoices = [
    ["INV-1001", "ORD-1001", "issued", "2026-03-20"],
    ["INV-1002", "ORD-1002", "issued", "2026-03-24"],
    ["INV-1003", "ORD-1003", "paid", "2026-03-01"],
  ];

  for (const [invoiceNumber, orderNumber, status, dueDate] of defaultInvoices) {
    await dbPool.execute(
      `INSERT INTO invoices (invoice_number, customer_id, order_id, total_amount, status, due_date, created_by)
       SELECT ?, o.customer_id, o.id, o.total_amount, ?, ?, u.id
       FROM orders o
       LEFT JOIN users u ON u.email = ?
       WHERE o.order_number = ?
       ON DUPLICATE KEY UPDATE
         total_amount = VALUES(total_amount),
         status = VALUES(status),
         due_date = VALUES(due_date)`,
      [invoiceNumber, status, dueDate, env.seedUsers.sales.email, orderNumber]
    );
  }
}

function slugifyBrandName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function ensureBrandCatalog() {
  await dbPool.execute(
    `CREATE TABLE IF NOT EXISTS brands (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(120) NOT NULL UNIQUE,
      slug VARCHAR(160) NOT NULL UNIQUE,
      logo LONGTEXT NULL,
      description TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`
  );

  for (const brandName of DEFAULT_BRANDS) {
    const slug = slugifyBrandName(brandName);

    await dbPool.execute(
      `INSERT INTO brands (name, slug, logo, description)
       VALUES (?, ?, NULL, NULL)
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [brandName, slug]
    );
  }
}

export async function ensureCategoryCatalog() {
  await ensureCategoriesTable();

  for (const categoryName of DEFAULT_CATEGORIES) {
    await dbPool.execute(
      `INSERT INTO categories (name)
       VALUES (?)
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [categoryName]
    );
  }
}
