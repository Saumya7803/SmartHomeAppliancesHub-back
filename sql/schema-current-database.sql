CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'admin', 'development_team', 'operator', 'sales') NOT NULL DEFAULT 'operator',
  status ENUM('active', 'suspended', 'disabled') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(30) NULL,
  company VARCHAR(160) NULL,
  status ENUM('lead', 'active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(30) NULL,
  company VARCHAR(160) NULL,
  status ENUM('lead', 'active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS brands (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL UNIQUE,
  slug VARCHAR(160) NOT NULL UNIQUE,
  logo LONGTEXT NULL,
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
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
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
  CONSTRAINT fk_products_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_products_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_products_status (status),
  INDEX idx_products_published (is_published),
  INDEX idx_products_category_id (category_id),
  INDEX idx_products_brand_id (brand_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT UNSIGNED NOT NULL,
  order_number VARCHAR(40) NOT NULL UNIQUE,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  support_status ENUM('open', 'in_progress', 'resolved') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_orders_status (status),
  INDEX idx_orders_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS invoices (
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
);

CREATE TABLE IF NOT EXISTS enquiries (
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
);

CREATE TABLE IF NOT EXISTS quotations (
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
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT UNSIGNED NOT NULL,
  order_number VARCHAR(40) NOT NULL UNIQUE,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  support_status ENUM('open', 'in_progress', 'resolved') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_orders_status (status),
  INDEX idx_orders_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS product_changes (
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
  CONSTRAINT fk_product_changes_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_product_changes_status (status),
  INDEX idx_product_changes_product (product_id)
);

CREATE TABLE IF NOT EXISTS order_changes (
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
);

CREATE TABLE IF NOT EXISTS customer_changes (
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
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  details JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_logs_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS feature_flags (
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
);

CREATE TABLE IF NOT EXISTS system_settings (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(120) NOT NULL UNIQUE,
  setting_value JSON NOT NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_system_settings_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS api_keys (
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
);

-- Development seed credentials:
-- admin@smarthome.com / Admin@123
-- manager@smarthome.com / Manager@123
-- dev@smarthome.com / Dev@123
-- operator@smarthome.com / Operator@123
-- sales@smarthomeappliances.co / Sales@123
INSERT INTO users (name, email, password, role)
VALUES (
  'Super Admin',
  'admin@smarthome.com',
  '$2a$10$/Yg.eqSaqx4ApVfZbwrOGeEUh2w6FKo3G6ZAA0u9hrYZAqQj8zf7e',
  'super_admin'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password = VALUES(password),
  role = 'super_admin';

INSERT INTO users (name, email, password, role)
VALUES (
  'Admin Manager',
  'manager@smarthome.com',
  '$2a$10$04RREpHv0vj.AQtmycYdQOFppIH30uEiQ0O.mK.xjw.0OHq/MvsJ.',
  'admin'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password = VALUES(password),
  role = 'admin';

INSERT INTO users (name, email, password, role)
VALUES (
  'Development Team',
  'dev@smarthome.com',
  '$2a$10$FEu8GO1Cd0hEPKcMO94iRu3LArkc.U8hb2KR1K3H9GBz67T8XaaSa',
  'development_team'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password = VALUES(password),
  role = 'development_team';

INSERT INTO users (name, email, password, role)
VALUES (
  'Operator',
  'operator@smarthome.com',
  '$2a$10$KiqCUrq.zd75ImNZEx.DMOUgMP9HT9t39iOs.Ubms5/Gq67B5fv9.',
  'operator'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password = VALUES(password),
  role = 'operator';

INSERT INTO users (name, email, password, role)
VALUES (
  'Sales Team',
  'sales@smarthomeappliances.co',
  '$2a$10$hCPLl5aePVTjj.JbMLtuR.E8Wb0.sa1g/5D82Vh6V8vQ7UTejGCTK',
  'sales'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password = VALUES(password),
  role = 'sales';

INSERT INTO customers (name, email, phone, company, status)
VALUES
  ('Apex Retail', 'ops@apexretail.com', '+91-9000000001', 'Apex Retail', 'active'),
  ('Blue Horizon Hotels', 'procurement@bluehorizon.com', '+91-9000000002', 'Blue Horizon Hotels', 'active'),
  ('Metro Residency', 'facilities@metroresidency.com', '+91-9000000003', 'Metro Residency', 'lead')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  phone = VALUES(phone),
  company = VALUES(company),
  status = VALUES(status);

INSERT INTO categories (name)
VALUES
  ('Refrigerator'),
  ('Air Conditioner'),
  ('Air Cooler'),
  ('Washing Machine'),
  ('Microwave'),
  ('TV')
ON DUPLICATE KEY UPDATE
  name = VALUES(name);

INSERT INTO brands (name, slug, logo, description)
VALUES
  ('LG', 'lg', NULL, NULL),
  ('Samsung', 'samsung', NULL, NULL),
  ('Haier', 'haier', NULL, NULL),
  ('Voltas', 'voltas', NULL, NULL),
  ('IFB', 'ifb', NULL, NULL),
  ('Symphony', 'symphony', NULL, NULL),
  ('Bajaj', 'bajaj', NULL, NULL)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description);

INSERT INTO products (
  name, model, category_id, brand_id, category, brand,
  price, stock_quantity, description, image_url, status, is_published
)
SELECT
  seed.name,
  seed.model,
  c.id,
  b.id,
  seed.category,
  seed.brand,
  seed.price,
  seed.stock_quantity,
  seed.description,
  seed.image_url,
  'approved',
  1
FROM (
  SELECT 'LG Dual Inverter Split AC' AS name, 'LG-AC-1.5T' AS model, 'Air Conditioner' AS category, 'LG' AS brand, 46990.00 AS price, 18 AS stock_quantity, 'Dual inverter split AC for efficient and stable room cooling.' AS description, 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Air_Conditioner_for_a_single_room.jpg' AS image_url
  UNION ALL SELECT 'Voltas Window AC', 'VOL-WIN-AC-1.5T', 'Air Conditioner', 'Voltas', 42990.00, 15, 'Window AC built for consistent cooling in office and small commercial spaces.', 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Air_conditioner_14.jpg'
  UNION ALL SELECT 'Bajaj Personal Air Cooler', 'BAJ-ACOOL-PERS', 'Air Cooler', 'Bajaj', 8990.00, 26, 'Compact personal cooler suitable for bedrooms and small offices.', 'https://upload.wikimedia.org/wikipedia/commons/5/56/Crompton_Desert_Air_Cooler.jpg'
  UNION ALL SELECT 'IFB Solo Microwave', 'IFB-MW-SOLO', 'Microwave', 'IFB', 9990.00, 16, 'Solo microwave oven for everyday heating and defrosting needs.', 'https://upload.wikimedia.org/wikipedia/commons/e/ef/LG_Microwave_oven.jpg'
  UNION ALL SELECT 'LG Double Door Refrigerator', 'LG-REF-DD', 'Refrigerator', 'LG', 32990.00, 12, 'Double door refrigerator with inverter compressor and fast cooling.', 'https://upload.wikimedia.org/wikipedia/commons/6/61/Panasonic_HOME_REFRIGERATOR_NR-C320WP-N.jpg'
  UNION ALL SELECT 'LG Front Load Washing Machine', 'LG-WM-FL', 'Washing Machine', 'LG', 28990.00, 10, 'Front load washing machine with smart wash programs and low noise.', 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Washing_Machine_Beko.jpg'
  UNION ALL SELECT 'Sony Bravia Pro Display 55-inch', 'SBP-55X900', 'TV', 'Sony', 74990.00, 8, '4K professional display built for continuous operation with vibrant color accuracy.', 'https://upload.wikimedia.org/wikipedia/commons/e/e2/LG_smart_TV.jpg'
  UNION ALL SELECT 'Samsung UHD Commercial TV 50-inch', 'SMC-50U7', 'TV', 'Samsung', 69990.00, 10, 'Industrial-ready UHD television optimized for long-hour commercial presentation.', 'https://upload.wikimedia.org/wikipedia/commons/9/91/1990s_Television_Set.jpg'
  UNION ALL SELECT 'LG Digital Signage TV 43-inch', 'LGS-43D', 'TV', 'LG', 52990.00, 12, 'Commercial signage display with stable playback and easy wall integration.', 'https://upload.wikimedia.org/wikipedia/commons/d/d1/19%22_Sylvania_CRT_television_with_Logitech_Harmony_remote.jpg'
  UNION ALL SELECT 'Panasonic ProVision Display 65-inch', 'PVP-65C', 'TV', 'Panasonic', 89990.00, 6, 'Large format business television with high contrast and secure connectivity.', 'https://upload.wikimedia.org/wikipedia/commons/d/d8/19%22_Crosley_television_set_with_NES.jpg'
) seed
LEFT JOIN categories c ON LOWER(c.name) = LOWER(seed.category)
LEFT JOIN brands b ON LOWER(b.name) = LOWER(seed.brand)
WHERE c.id IS NOT NULL
  AND b.id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM products p
    WHERE p.model = seed.model
  );

UPDATE products p
LEFT JOIN categories c ON LOWER(c.name) = LOWER(p.category)
LEFT JOIN brands b ON LOWER(b.name) = LOWER(p.brand)
SET
  p.category_id = COALESCE(c.id, p.category_id),
  p.brand_id = COALESCE(b.id, p.brand_id),
  p.image_url = CASE p.model
    WHEN 'LG-AC-1.5T' THEN 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Air_Conditioner_for_a_single_room.jpg'
    WHEN 'VOL-WIN-AC-1.5T' THEN 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Air_conditioner_14.jpg'
    WHEN 'BAJ-ACOOL-PERS' THEN 'https://upload.wikimedia.org/wikipedia/commons/5/56/Crompton_Desert_Air_Cooler.jpg'
    WHEN 'IFB-MW-SOLO' THEN 'https://upload.wikimedia.org/wikipedia/commons/e/ef/LG_Microwave_oven.jpg'
    WHEN 'LG-REF-DD' THEN 'https://upload.wikimedia.org/wikipedia/commons/6/61/Panasonic_HOME_REFRIGERATOR_NR-C320WP-N.jpg'
    WHEN 'LG-WM-FL' THEN 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Washing_Machine_Beko.jpg'
    WHEN 'SBP-55X900' THEN 'https://upload.wikimedia.org/wikipedia/commons/e/e2/LG_smart_TV.jpg'
    WHEN 'SMC-50U7' THEN 'https://upload.wikimedia.org/wikipedia/commons/9/91/1990s_Television_Set.jpg'
    WHEN 'LGS-43D' THEN 'https://upload.wikimedia.org/wikipedia/commons/d/d1/19%22_Sylvania_CRT_television_with_Logitech_Harmony_remote.jpg'
    WHEN 'PVP-65C' THEN 'https://upload.wikimedia.org/wikipedia/commons/d/d8/19%22_Crosley_television_set_with_NES.jpg'
    ELSE p.image_url
  END,
  p.status = 'approved',
  p.is_published = 1
WHERE p.model IN (
  'LG-AC-1.5T',
  'VOL-WIN-AC-1.5T',
  'BAJ-ACOOL-PERS',
  'IFB-MW-SOLO',
  'LG-REF-DD',
  'LG-WM-FL',
  'SBP-55X900',
  'SMC-50U7',
  'LGS-43D',
  'PVP-65C'
);

INSERT INTO orders (customer_id, order_number, total_amount, status, support_status)
SELECT id, 'ORD-1001', 129999.00, 'confirmed', 'open' FROM customers WHERE email = 'ops@apexretail.com'
ON DUPLICATE KEY UPDATE
  total_amount = VALUES(total_amount),
  status = VALUES(status),
  support_status = VALUES(support_status);

INSERT INTO orders (customer_id, order_number, total_amount, status, support_status)
SELECT id, 'ORD-1002', 84500.00, 'shipped', 'in_progress' FROM customers WHERE email = 'procurement@bluehorizon.com'
ON DUPLICATE KEY UPDATE
  total_amount = VALUES(total_amount),
  status = VALUES(status),
  support_status = VALUES(support_status);

INSERT INTO orders (customer_id, order_number, total_amount, status, support_status)
SELECT id, 'ORD-1003', 152400.00, 'delivered', 'resolved' FROM customers WHERE email = 'facilities@metroresidency.com'
ON DUPLICATE KEY UPDATE
  total_amount = VALUES(total_amount),
  status = VALUES(status),
  support_status = VALUES(support_status);

INSERT INTO invoices (invoice_number, customer_id, order_id, total_amount, status, due_date, created_by)
SELECT 'INV-1001', o.customer_id, o.id, o.total_amount, 'issued', '2026-03-20', u.id
FROM orders o
LEFT JOIN users u ON u.email = 'sales@smarthomeappliances.co'
WHERE o.order_number = 'ORD-1001'
ON DUPLICATE KEY UPDATE
  total_amount = VALUES(total_amount),
  status = VALUES(status),
  due_date = VALUES(due_date);

INSERT INTO invoices (invoice_number, customer_id, order_id, total_amount, status, due_date, created_by)
SELECT 'INV-1002', o.customer_id, o.id, o.total_amount, 'issued', '2026-03-24', u.id
FROM orders o
LEFT JOIN users u ON u.email = 'sales@smarthomeappliances.co'
WHERE o.order_number = 'ORD-1002'
ON DUPLICATE KEY UPDATE
  total_amount = VALUES(total_amount),
  status = VALUES(status),
  due_date = VALUES(due_date);

INSERT INTO invoices (invoice_number, customer_id, order_id, total_amount, status, due_date, created_by)
SELECT 'INV-1003', o.customer_id, o.id, o.total_amount, 'paid', '2026-03-01', u.id
FROM orders o
LEFT JOIN users u ON u.email = 'sales@smarthomeappliances.co'
WHERE o.order_number = 'ORD-1003'
ON DUPLICATE KEY UPDATE
  total_amount = VALUES(total_amount),
  status = VALUES(status),
  due_date = VALUES(due_date);

INSERT INTO feature_flags (flag_key, label, description, is_enabled)
VALUES
  ('maintenance_banner', 'Maintenance Banner', 'Show a maintenance banner across admin surfaces.', 0),
  ('extended_audit_logs', 'Extended Audit Logs', 'Capture extended request diagnostics for debugging.', 1),
  ('beta_product_editor', 'Beta Product Editor', 'Enable the experimental product editor workflow.', 0)
ON DUPLICATE KEY UPDATE
  label = VALUES(label),
  description = VALUES(description);

INSERT INTO system_settings (setting_key, setting_value)
VALUES
  ('payment_currency', JSON_QUOTE('INR')),
  ('payment_gateway_mode', JSON_QUOTE('sandbox')),
  ('payment_auto_capture', 'true'),
  ('payment_retry_window_minutes', '15')
ON DUPLICATE KEY UPDATE
  setting_value = VALUES(setting_value);
