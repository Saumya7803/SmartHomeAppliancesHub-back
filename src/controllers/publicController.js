import { dbPool } from "../config/db.js";
import { createEnquiry } from "../models/enquiryModel.js";
import { logAudit } from "../utils/audit.js";
import { mapProductRow } from "../utils/serializers.js";

export async function listPublishedProducts(req, res, next) {
  try {
    const [rows] = await dbPool.execute(
      `SELECT p.*, c.name AS category_name, b.name AS brand_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN brands b ON b.id = p.brand_id
       WHERE LOWER(p.status) = 'approved' AND p.is_published = 1
       ORDER BY p.updated_at DESC`
    );

    return res.json({ products: rows.map(mapProductRow) });
  } catch (error) {
    return next(error);
  }
}

function normalizePublicEnquiryPayload(body) {
  return {
    customer_name: String(body.customer_name || "").trim(),
    email: String(body.email || "")
      .trim()
      .toLowerCase(),
    phone: String(body.phone || "").trim(),
    product_id: body.product_id ? Number(body.product_id) : null,
    product_name: String(body.product_name || "").trim(),
    quantity: Math.max(1, Number(body.quantity || 1)),
    message: body.message ? String(body.message).trim() : null,
  };
}

export async function createPublicEnquiry(req, res, next) {
  try {
    const payload = normalizePublicEnquiryPayload(req.body);

    let resolvedProductId = payload.product_id;
    let resolvedProductName = payload.product_name;

    if (resolvedProductId) {
      const [[productRow]] = await dbPool.execute(
        `SELECT id, name
         FROM products
         WHERE id = ?
           AND LOWER(status) = 'approved'
         LIMIT 1`,
        [resolvedProductId]
      );

      if (!productRow) {
        return res.status(400).json({ message: "Selected product does not exist" });
      }

      resolvedProductId = Number(productRow.id);
      if (!resolvedProductName) {
        resolvedProductName = productRow.name;
      }
    }

    if (!resolvedProductName) {
      return res.status(400).json({ message: "Product name is required" });
    }

    const result = await createEnquiry({
      ...payload,
      product_id: resolvedProductId,
      product_name: resolvedProductName,
      status: "new",
      source: "website",
    });

    await logAudit({
      action: "create_public_enquiry",
      entityType: "enquiry",
      entityId: result.insertId,
      details: {
        source: "website",
        customer_name: payload.customer_name,
        email: payload.email,
        phone: payload.phone,
        product_id: resolvedProductId,
        product_name: resolvedProductName,
        quantity: payload.quantity,
      },
    });

    return res.status(201).json({
      message: "Enquiry created successfully",
      enquiryId: result.insertId,
      enquiryCode: result.enquiryCode,
      status: "new",
    });
  } catch (error) {
    return next(error);
  }
}
