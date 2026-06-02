# SmartHome Admin Backend

## Setup

1. Install dependencies:
   - `npm install`
2. Ensure MySQL is running.
3. Run SQL schema:
   - `mysql -u root -p < sql/schema.sql`
4. Edit `.env` if needed.
5. Start backend:
   - `npm run dev`

### Windows + XAMPP Quick Commands

From project root:

- Apply schema to XAMPP MySQL:
  - `Get-Content backend\sql\schema.sql | & "C:\xampp\mysql\bin\mysql.exe" -u root`
- Start backend:
  - `npm run backend:dev`

Base URL: `http://localhost:5000/api`

## Health Check

- `GET /api/health`

If Vite shows `http proxy error /api/* ECONNREFUSED`, backend is not running on `localhost:5000`.

### Verify Database Objects

- Check DB exists:
  - `& "C:\xampp\mysql\bin\mysql.exe" -u root -e "SHOW DATABASES LIKE 'smarthome_b2b';"`
- Check brand table/seed:
  - `& "C:\xampp\mysql\bin\mysql.exe" -u root -D smarthome_b2b -e "SELECT id,name,slug FROM brands ORDER BY id;"`

## Main APIs

- `POST /auth/login`
- `GET /auth/me`
- `GET /products` (public approved + published)
- `GET /brands` (public brand catalog)
- `POST /brands`
- `PUT /brands/:id`
- `DELETE /brands/:id`
- `GET /admin/*` (admin role only)
- `GET /operator/*` (operator role only)
- `GET /sales/*` (sales/admin role only)

## Brands Table

`brands` schema:

- `id` BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- `name` VARCHAR(120) UNIQUE NOT NULL
- `slug` VARCHAR(160) UNIQUE NOT NULL
- `logo` LONGTEXT NULL
- `description` TEXT NULL
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

## Default Login Credentials (Development)

- Super Admin: `admin@smarthome.com` / `Admin@123`
- Admin: `manager@smarthome.com` / `Manager@123`
- Development Team: `dev@smarthome.com` / `Dev@123`
- Operator: `operator@smarthome.com` / `Operator@123`
- Sales Team: `sales@smarthome.com` / `Sales@123`

These credentials are seeded by `schema.sql` and refreshed on backend start when `SEED_DEFAULT_USERS=true`.
If `SEED_DEFAULT_USERS` is unset, seeding defaults to enabled in development and disabled in production.
