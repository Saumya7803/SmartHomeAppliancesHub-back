import { Router } from "express";
import { body } from "express-validator";
import { createPublicEnquiry, listPublishedProducts } from "../controllers/publicController.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

router.get("/", listPublishedProducts);
router.post(
  "/enquiries",
  [
    body("customer_name")
      .trim()
      .isLength({ min: 2, max: 120 })
      .withMessage("Customer name is required"),
    body("email").isEmail().withMessage("A valid email is required"),
    body("phone")
      .trim()
      .isLength({ min: 7, max: 40 })
      .withMessage("A valid phone number is required"),
    body("product_id").optional({ nullable: true }).isInt({ min: 1 }),
    body("product_name")
      .trim()
      .isLength({ min: 2, max: 180 })
      .withMessage("Product name is required"),
    body("quantity")
      .optional({ nullable: true })
      .isInt({ min: 1, max: 100000 })
      .withMessage("Quantity must be at least 1"),
    body("message").optional({ nullable: true }).isLength({ max: 3000 }),
  ],
  validateRequest,
  createPublicEnquiry
);

export default router;
