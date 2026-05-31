import { Router } from "express";
import {
  createCustomerEntry,
  createOrderEntry,
  createProductEntry,
  listCustomers,
  listOrders,
  listProducts,
  listSubmissionQueue,
} from "../controllers/operatorController.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  customerPayloadValidation,
  orderPayloadValidation,
  productPayloadValidation,
} from "./validators.js";

const router = Router();

router.use(authenticateToken, requireRole("operator"));

router.get("/products", listProducts);
router.post("/products", productPayloadValidation, validateRequest, createProductEntry);

router.get("/orders", listOrders);
router.post("/orders", orderPayloadValidation, validateRequest, createOrderEntry);

router.get("/customers", listCustomers);
router.post("/customers", customerPayloadValidation, validateRequest, createCustomerEntry);
router.get("/submissions", listSubmissionQueue);

router.get("/customers", listCustomers);
router.post("/customers", customerPayloadValidation, validateRequest, createCustomerEntry);

export default router;
