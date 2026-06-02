import { dbPool } from "../config/db.js";

function getExecutor(connection) {
  return connection || dbPool;
}

function normalizeText(value) {
  return String(value || "").trim();
}

function slugifyName(name) {
  const value = normalizeText(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return value || `brand-${Date.now()}`;
}

async function selectCategoryById(executor, categoryId) {
  const [rows] = await executor.execute(
    `SELECT id, name FROM categories WHERE id = ? LIMIT 1`,
    [categoryId]
  );
  return rows.length ? rows[0] : null;
}

async function selectCategoryByName(executor, categoryName) {
  const [rows] = await executor.execute(
    `SELECT id, name FROM categories WHERE LOWER(name) = LOWER(?) LIMIT 1`,
    [categoryName]
  );
  return rows.length ? rows[0] : null;
}

async function insertCategory(executor, categoryName) {
  const [result] = await executor.execute(
    `INSERT INTO categories (name) VALUES (?)`,
    [categoryName]
  );
  return selectCategoryById(executor, result.insertId);
}

async function selectBrandById(executor, brandId) {
  const [rows] = await executor.execute(
    `SELECT id, name FROM brands WHERE id = ? LIMIT 1`,
    [brandId]
  );
  return rows.length ? rows[0] : null;
}

async function selectBrandByName(executor, brandName) {
  const [rows] = await executor.execute(
    `SELECT id, name FROM brands WHERE LOWER(name) = LOWER(?) LIMIT 1`,
    [brandName]
  );
  return rows.length ? rows[0] : null;
}

async function isBrandSlugTaken(executor, slug) {
  const [rows] = await executor.execute(
    `SELECT id FROM brands WHERE slug = ? LIMIT 1`,
    [slug]
  );
  return rows.length > 0;
}

async function buildUniqueBrandSlug(executor, baseSlug) {
  let candidate = baseSlug;
  let suffix = 2;

  while (await isBrandSlugTaken(executor, candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function insertBrand(executor, brandName) {
  const baseSlug = slugifyName(brandName);
  const uniqueSlug = await buildUniqueBrandSlug(executor, baseSlug);
  const [result] = await executor.execute(
    `INSERT INTO brands (name, slug, logo, description) VALUES (?, ?, NULL, NULL)`,
    [brandName, uniqueSlug]
  );
  return selectBrandById(executor, result.insertId);
}

export async function ensureCategoryReference(
  { categoryId, categoryName },
  { connection = null, autoCreateFromName = true } = {}
) {
  const executor = getExecutor(connection);
  const normalizedCategoryId = Number(categoryId);
  const normalizedCategoryName = normalizeText(categoryName);

  if (Number.isFinite(normalizedCategoryId) && normalizedCategoryId > 0) {
    const category = await selectCategoryById(executor, normalizedCategoryId);
    if (!category) {
      const error = new Error("Selected category does not exist");
      error.statusCode = 400;
      throw error;
    }
    return category;
  }

  if (!normalizedCategoryName) {
    const error = new Error("Category is required");
    error.statusCode = 400;
    throw error;
  }

  const existingCategory = await selectCategoryByName(executor, normalizedCategoryName);
  if (existingCategory) {
    return existingCategory;
  }

  if (!autoCreateFromName) {
    const error = new Error("Selected category does not exist");
    error.statusCode = 400;
    throw error;
  }

  try {
    return await insertCategory(executor, normalizedCategoryName);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      const fallbackCategory = await selectCategoryByName(executor, normalizedCategoryName);
      if (fallbackCategory) {
        return fallbackCategory;
      }
    }
    throw error;
  }
}

export async function ensureBrandReference(
  { brandId, brandName },
  { connection = null, autoCreateFromName = true } = {}
) {
  const executor = getExecutor(connection);
  const normalizedBrandId = Number(brandId);
  const normalizedBrandName = normalizeText(brandName);

  if (Number.isFinite(normalizedBrandId) && normalizedBrandId > 0) {
    const brand = await selectBrandById(executor, normalizedBrandId);
    if (!brand) {
      const error = new Error("Selected brand does not exist");
      error.statusCode = 400;
      throw error;
    }
    return brand;
  }

  if (!normalizedBrandName) {
    const error = new Error("Brand is required");
    error.statusCode = 400;
    throw error;
  }

  const existingBrand = await selectBrandByName(executor, normalizedBrandName);
  if (existingBrand) {
    return existingBrand;
  }

  if (!autoCreateFromName) {
    const error = new Error("Selected brand does not exist");
    error.statusCode = 400;
    throw error;
  }

  try {
    return await insertBrand(executor, normalizedBrandName);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      const fallbackBrand = await selectBrandByName(executor, normalizedBrandName);
      if (fallbackBrand) {
        return fallbackBrand;
      }
    }
    throw error;
  }
}
