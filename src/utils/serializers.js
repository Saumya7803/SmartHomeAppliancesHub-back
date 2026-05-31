export function parseJson(value, fallback = null) {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function mapProductRow(row) {
  const categoryName = row.category_name || row.category || null;
  const brandName = row.brand_name || row.brand || null;

  return {
    ...row,
    category: categoryName,
    brand: brandName,
    category_id: row.category_id ? Number(row.category_id) : null,
    brand_id: row.brand_id ? Number(row.brand_id) : null,
    price: Number(row.price || 0),
    stock_quantity: Number(row.stock_quantity || 0),
    specifications: parseJson(row.specifications, {}),
    is_published: Boolean(row.is_published),
    isPublished: Boolean(row.is_published),
    imageUrl: row.image_url || null,
    brochureUrl: row.brochure_url || null,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
}

export function mapChangeRow(row) {
  return {
    ...row,
    change_data: parseJson(row.change_data, {}),
  };
}

export function mapBrandRow(row) {
  return {
    ...row,
    logoUrl: row.logo || null,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
}
