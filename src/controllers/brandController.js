import { dbPool } from "../config/db.js";
import { mapBrandRow } from "../utils/serializers.js";

function slugifyName(name) {
  const value = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return value || `brand-${Date.now()}`;
}

function normalizeOptionalText(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
}

async function isSlugTaken(slug, excludeId = null) {
  const hasExclude = Number.isFinite(excludeId);
  const params = hasExclude ? [slug, excludeId] : [slug];
  const query = hasExclude
    ? `SELECT id FROM brands WHERE slug = ? AND id <> ? LIMIT 1`
    : `SELECT id FROM brands WHERE slug = ? LIMIT 1`;

  const [rows] = await dbPool.execute(query, params);
  return rows.length > 0;
}

async function buildUniqueSlug(baseSlug, excludeId = null) {
  let candidate = baseSlug;
  let suffix = 2;

  while (await isSlugTaken(candidate, excludeId)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function findBrandById(brandId) {
  const [rows] = await dbPool.execute(`SELECT * FROM brands WHERE id = ? LIMIT 1`, [brandId]);
  return rows.length ? rows[0] : null;
}

async function hasDuplicateName(name, excludeId = null) {
  const hasExclude = Number.isFinite(excludeId);
  const params = hasExclude ? [name, excludeId] : [name];
  const query = hasExclude
    ? `SELECT id FROM brands WHERE LOWER(name) = LOWER(?) AND id <> ? LIMIT 1`
    : `SELECT id FROM brands WHERE LOWER(name) = LOWER(?) LIMIT 1`;
  const [rows] = await dbPool.execute(query, params);
  return rows.length > 0;
}

export async function listBrands(req, res, next) {
  try {
    const search = String(req.query.search || "").trim();

    const hasSearch = Boolean(search);
    const params = hasSearch ? [`%${search}%`, `%${search}%`] : [];
    const query = hasSearch
      ? `SELECT * FROM brands WHERE name LIKE ? OR description LIKE ? ORDER BY name ASC`
      : `SELECT * FROM brands ORDER BY name ASC`;

    const [rows] = await dbPool.execute(query, params);

    return res.json({
      brands: rows.map(mapBrandRow),
    });
  } catch (error) {
    return next(error);
  }
}

export async function createBrand(req, res, next) {
  try {
    const name = String(req.body.name || "").trim();
    const logo = normalizeOptionalText(req.body.logo);
    const description = normalizeOptionalText(req.body.description);

    if (await hasDuplicateName(name)) {
      return res.status(409).json({ message: "Brand already exists" });
    }

    const uniqueSlug = await buildUniqueSlug(slugifyName(name));

    const [result] = await dbPool.execute(
      `INSERT INTO brands (name, slug, logo, description) VALUES (?, ?, ?, ?)`,
      [name, uniqueSlug, logo, description]
    );

    const createdBrand = await findBrandById(result.insertId);

    return res.status(201).json({
      message: "Brand created",
      brand: mapBrandRow(createdBrand),
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Brand already exists" });
    }
    return next(error);
  }
}

export async function updateBrand(req, res, next) {
  try {
    const brandId = Number(req.params.id);
    const currentBrand = await findBrandById(brandId);

    if (!currentBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const hasName = req.body.name !== undefined;
    const hasLogo = req.body.logo !== undefined;
    const hasDescription = req.body.description !== undefined;

    const nextName = hasName ? String(req.body.name || "").trim() : currentBrand.name;
    const nextLogo = hasLogo ? normalizeOptionalText(req.body.logo) : currentBrand.logo;
    const nextDescription = hasDescription
      ? normalizeOptionalText(req.body.description)
      : currentBrand.description;

    if (await hasDuplicateName(nextName, brandId)) {
      return res.status(409).json({ message: "Brand already exists" });
    }

    let nextSlug = currentBrand.slug;
    if (nextName.toLowerCase() !== String(currentBrand.name || "").toLowerCase()) {
      nextSlug = await buildUniqueSlug(slugifyName(nextName), brandId);
    }

    await dbPool.execute(
      `UPDATE brands
       SET name = ?, slug = ?, logo = ?, description = ?, updated_at = NOW()
       WHERE id = ?`,
      [nextName, nextSlug, nextLogo, nextDescription, brandId]
    );

    const updatedBrand = await findBrandById(brandId);

    return res.json({
      message: "Brand updated",
      brand: mapBrandRow(updatedBrand),
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Brand already exists" });
    }
    return next(error);
  }
}

export async function deleteBrand(req, res, next) {
  try {
    const brandId = Number(req.params.id);
    const brand = await findBrandById(brandId);

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const [[usage]] = await dbPool.execute(
      `SELECT COUNT(*) AS count
       FROM products
       WHERE brand_id = ? OR LOWER(brand) = LOWER(?)`,
      [brandId, brand.name]
    );

    if (Number(usage.count) > 0) {
      return res.status(409).json({
        message: "Brand is used by existing products. Update or remove those products first.",
      });
    }

    await dbPool.execute(`DELETE FROM brands WHERE id = ?`, [brandId]);

    return res.json({ message: "Brand deleted", brandId });
  } catch (error) {
    return next(error);
  }
}
