import { body, param } from "express-validator";

const MAX_IMAGE_DATA_URL_LENGTH = 1_600_000;
const MAX_BROCHURE_DATA_URL_LENGTH = 2_200_000;
const MAX_TOTAL_ASSET_DATA_URL_LENGTH = 3_500_000;

export const productPayloadValidation = [
  body("name").trim().isLength({ min: 2, max: 180 }).withMessage("Name is required"),
  body("model").trim().isLength({ min: 1, max: 120 }).withMessage("Model is required"),
  body("category_id")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("category_id must be a valid id"),
  body("brand_id")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("brand_id must be a valid id"),
  body("category")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Category must be between 2 and 100 characters"),
  body("brand")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Brand must be between 2 and 100 characters"),
  body("stock_quantity")
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage("stock_quantity must be a non-negative integer"),
  body().custom((value) => {
    const hasCategoryId = Number.isFinite(Number(value?.category_id)) && Number(value?.category_id) > 0;
    const hasCategoryName = Boolean(String(value?.category || "").trim());
    const hasBrandId = Number.isFinite(Number(value?.brand_id)) && Number(value?.brand_id) > 0;
    const hasBrandName = Boolean(String(value?.brand || "").trim());

    if (!hasCategoryId && !hasCategoryName) {
      throw new Error("Either category_id or category is required");
    }

    if (!hasBrandId && !hasBrandName) {
      throw new Error("Either brand_id or brand is required");
    }

    return true;
  }),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a valid amount"),
  body("description").trim().isLength({ min: 10 }).withMessage("Description is required"),
  body("specifications")
    .optional()
    .custom((value) => {
      if (typeof value === "string") {
        JSON.parse(value);
      }

      if (typeof value === "object" || value === undefined) {
        return true;
      }

      throw new Error("Specifications must be valid JSON or object");
    }),
  body("image_url")
    .trim()
    .isLength({ min: 5, max: MAX_IMAGE_DATA_URL_LENGTH })
    .withMessage("Product image is required and must be 1 MB or smaller."),
  body("brochure_url")
    .optional({ nullable: true })
    .isLength({ max: MAX_BROCHURE_DATA_URL_LENGTH })
    .withMessage("Datasheet is too large. Please upload a PDF up to 1.5 MB."),
  body().custom((value) => {
    const imageLength = String(value?.image_url || "").length;
    const brochureLength = String(value?.brochure_url || "").length;

    if (imageLength + brochureLength > MAX_TOTAL_ASSET_DATA_URL_LENGTH) {
      throw new Error("Uploaded files are too large. Use a smaller image or datasheet PDF.");
    }

    return true;
  }),
];

export const productIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("Valid product id required"),
];

export const customerPayloadValidation = [
  body("name").trim().isLength({ min: 2, max: 120 }).withMessage("Customer name is required"),
  body("email").isEmail().withMessage("A valid customer email is required"),
  body("phone").optional({ nullable: true }).trim().isLength({ max: 30 }),
  body("company").optional({ nullable: true }).trim().isLength({ max: 160 }),
  body("status").optional().isIn(["lead", "active", "inactive"]),
];

export const changeIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("Valid change id required"),
];

export const orderIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("Valid order id required"),
];

export const orderPayloadValidation = [
  body("customer_id").isInt({ min: 1 }).withMessage("Valid customer is required"),
  body("order_number").trim().isLength({ min: 3, max: 40 }).withMessage("Order number is required"),
  body("total_amount").isFloat({ min: 0 }).withMessage("Order amount must be valid"),
  body("status").optional().isIn(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
  body("support_status").optional().isIn(["open", "in_progress", "resolved"]),
];

export const userIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("Valid user id required"),
];
