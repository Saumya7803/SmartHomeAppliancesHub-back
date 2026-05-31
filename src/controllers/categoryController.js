import { dbPool } from "../config/db.js";

function mapCategoryRow(row) {
  return {
    ...row,
    createdAt: row.created_at || null,
  };
}

async function hasDuplicateName(name) {
  const [rows] = await dbPool.execute(
    `SELECT id FROM categories WHERE LOWER(name) = LOWER(?) LIMIT 1`,
    [name]
  );
  return rows.length > 0;
}

export async function listCategories(req, res, next) {
  try {
    const search = String(req.query.search || "").trim();
    const hasSearch = Boolean(search);
    const params = hasSearch ? [`%${search}%`] : [];
    const query = hasSearch
      ? `SELECT id, name, created_at FROM categories WHERE name LIKE ? ORDER BY name ASC`
      : `SELECT id, name, created_at FROM categories ORDER BY name ASC`;

    const [rows] = await dbPool.execute(query, params);

    return res.json({
      categories: rows.map(mapCategoryRow),
    });
  } catch (error) {
    return next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const name = String(req.body.name || "").trim();

    if (await hasDuplicateName(name)) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const [result] = await dbPool.execute(
      `INSERT INTO categories (name) VALUES (?)`,
      [name]
    );
    const [rows] = await dbPool.execute(
      `SELECT id, name, created_at FROM categories WHERE id = ? LIMIT 1`,
      [result.insertId]
    );

    return res.status(201).json({
      message: "Category created",
      category: rows.length ? mapCategoryRow(rows[0]) : null,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Category already exists" });
    }
    return next(error);
  }
}
