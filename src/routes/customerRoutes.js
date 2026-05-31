import { Router } from "express";
import { body, param } from "express-validator";
import {
  getCustomerAccount,
  listMyOrders,
  listMyQuotations,
  listMySavedProducts,
  removeMyProduct,
  saveMyProduct,
  updateMyProfile,
} from "../controllers/customerController.js";
import { authenticateCustomerToken } from "../middleware/authenticateCustomerToken.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

const phoneRegex = /^\+?[0-9\s()\-]{7,20}$/;

router.use(authenticateCustomerToken);

router.get("/account", getCustomerAccount);
router.get("/orders", listMyOrders);
router.get("/quotes", listMyQuotations);
router.get("/saved-products", listMySavedProducts);

router.put(
  "/profile",
  [
    body("fullName").trim().isLength({ min: 2, max: 120 }).withMessage("Full name is required"),
    body("companyName").optional({ nullable: true }).trim().isLength({ max: 160 }),
    body("phoneNumber")
      .trim()
      .matches(phoneRegex)
      .withMessage("A valid phone number is required"),
  ],
  validateRequest,
  updateMyProfile
);

router.post(
  "/saved-products/:productId",
  [param("productId").isInt({ min: 1 }).withMessage("Valid product id required")],
  validateRequest,
  saveMyProduct
);

router.delete(
  "/saved-products/:productId",
  [param("productId").isInt({ min: 1 }).withMessage("Valid product id required")],
  validateRequest,
  removeMyProduct
);

export default router;
