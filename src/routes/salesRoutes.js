import { Router } from "express";
import { body, param } from "express-validator";
import {
  approveSalesQuotation,
  createSalesCustomer,
  createSalesEnquiry,
  createSalesInvoice,
  createSalesOrder,
  createQuotationFromEnquiry,
  getSalesEnquiryById,
  getSalesQuotationById,
  getSalesDashboardStats,
  listSalesAssignedCustomers,
  listSalesCustomers,
  listSalesEnquiries,
  listSalesInventory,
  listSalesInvoices,
  listSalesOrders,
  listSalesProducts,
  listSalesQuotations,
  assignSalesEnquiry,
  sendSalesQuotation,
  updateSalesCustomer,
  updateSalesEnquiryStatus,
  updateSalesOrderStatus,
} from "../controllers/salesController.js";
import { allowRoles } from "../middleware/allowRoles.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { customerPayloadValidation, orderIdValidation, orderPayloadValidation } from "./validators.js";

const router = Router();

router.use(authenticateToken, allowRoles(["SUPER_ADMIN", "ADMIN", "SALES"]));

router.get("/dashboard", getSalesDashboardStats);

router.get("/products", listSalesProducts);
router.get("/inventory", listSalesInventory);

router.get("/orders", listSalesOrders);
router.post("/orders", orderPayloadValidation, validateRequest, createSalesOrder);
router.patch(
  "/orders/:id/status",
  [
    ...orderIdValidation,
    body("status")
      .optional()
      .isIn(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
    body("support_status")
      .optional()
      .isIn(["open", "in_progress", "resolved"]),
  ],
  validateRequest,
  updateSalesOrderStatus
);

router.get("/customers", listSalesCustomers);
router.post("/customers", customerPayloadValidation, validateRequest, createSalesCustomer);
router.patch(
  "/customers/:id",
  [
    param("id").isInt({ min: 1 }).withMessage("Valid customer id required"),
    body("name").optional().trim().isLength({ min: 2, max: 120 }),
    body("email").optional().isEmail(),
    body("phone").optional({ nullable: true }).trim().isLength({ max: 30 }),
    body("company").optional({ nullable: true }).trim().isLength({ max: 160 }),
    body("status").optional().isIn(["lead", "active", "inactive"]),
  ],
  validateRequest,
  updateSalesCustomer
);

router.get("/invoices", listSalesInvoices);
router.post(
  "/invoices",
  [
    body("invoice_number").trim().isLength({ min: 3, max: 40 }).withMessage("Invoice number is required"),
    body("customer_id").isInt({ min: 1 }).withMessage("Valid customer is required"),
    body("order_id").optional({ nullable: true }).isInt({ min: 1 }),
    body("total_amount").isFloat({ min: 0 }).withMessage("Invoice amount must be valid"),
    body("status").optional().isIn(["draft", "issued", "paid", "overdue"]),
    body("due_date").optional({ nullable: true }).isISO8601().toDate(),
    body("issued_at").optional({ nullable: true }).isISO8601().toDate(),
  ],
  validateRequest,
  createSalesInvoice
);

router.get("/enquiries", listSalesEnquiries);
router.post(
  "/enquiries",
  [
    body("customer_name").trim().isLength({ min: 2, max: 120 }),
    body("email").isEmail(),
    body("phone").trim().isLength({ min: 7, max: 40 }),
    body("product_id").optional({ nullable: true }).isInt({ min: 1 }),
    body("product_name").trim().isLength({ min: 2, max: 180 }),
    body("quantity").optional({ nullable: true }).isInt({ min: 1, max: 100000 }),
    body("message").optional({ nullable: true }).isLength({ max: 3000 }),
    body("status").optional().isIn(["new", "contacted", "quoted", "closed"]),
  ],
  validateRequest,
  createSalesEnquiry
);
router.get(
  "/enquiries/:id",
  [param("id").isInt({ min: 1 }).withMessage("Valid enquiry id required")],
  validateRequest,
  getSalesEnquiryById
);
router.patch(
  "/enquiries/:id/status",
  [
    param("id").isInt({ min: 1 }).withMessage("Valid enquiry id required"),
    body("status").isIn(["new", "contacted", "quoted", "closed"]),
  ],
  validateRequest,
  updateSalesEnquiryStatus
);
router.patch(
  "/enquiries/:id/assign",
  requireRole("super_admin", "admin"),
  [
    param("id").isInt({ min: 1 }).withMessage("Valid enquiry id required"),
    body("assigned_to").optional({ nullable: true }).isInt({ min: 1 }),
  ],
  validateRequest,
  assignSalesEnquiry
);
router.post(
  "/enquiries/:id/quotations",
  [
    param("id").isInt({ min: 1 }).withMessage("Valid enquiry id required"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be valid"),
    body("quantity").optional({ nullable: true }).isInt({ min: 1, max: 100000 }),
    body("discount").optional({ nullable: true }).isFloat({ min: 0, max: 100 }),
    body("valid_until").optional({ nullable: true }).isISO8601().toDate(),
    body("notes").optional({ nullable: true }).isLength({ max: 3000 }),
    body("product_name").optional({ nullable: true }).isLength({ min: 2, max: 180 }),
  ],
  validateRequest,
  createQuotationFromEnquiry
);

router.get("/quotations", listSalesQuotations);
router.get(
  "/quotations/:id",
  [param("id").isInt({ min: 1 }).withMessage("Valid quotation id required")],
  validateRequest,
  getSalesQuotationById
);
router.post(
  "/quotations/:id/approve",
  requireRole("super_admin", "admin"),
  [param("id").isInt({ min: 1 }).withMessage("Valid quotation id required")],
  validateRequest,
  approveSalesQuotation
);
router.post(
  "/quotations/:id/send",
  [
    param("id").isInt({ min: 1 }).withMessage("Valid quotation id required"),
    body("subject").optional({ nullable: true }).isLength({ min: 3, max: 220 }),
    body("body").optional({ nullable: true }).isLength({ max: 10000 }),
  ],
  validateRequest,
  sendSalesQuotation
);

router.get("/assigned-customers", allowRoles(["SALES"]), listSalesAssignedCustomers);

export default router;
