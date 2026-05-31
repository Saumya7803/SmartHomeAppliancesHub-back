import { Router } from "express";
import { body, param } from "express-validator";
import { login, me } from "../controllers/authController.js";
import {
  approveChange,
  createApiKey,
  createProduct,
  createUser,
  deleteProduct,
  deleteUserByBody,
  deleteUser,
  getDashboardStats,
  listInventory,
  getPaymentSettings,
  getRoleManagementOverview,
  getSystemLogs,
  listApiKeys,
  listAuditLogs,
  listCustomers,
  listOrders,
  listPendingChanges,
  listProducts,
  listUsers,
  publishProduct,
  rejectChange,
  updateOrderStatus,
  updateProduct,
  updatePaymentSettings,
  updateUserProfile,
  updateUserRole,
  updateUserStatus,
  resetUserPassword,
  revokeApiKey,
} from "../controllers/adminController.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { USER_ROLE_VALUES } from "../utils/roles.js";
import {
  changeIdValidation,
  orderIdValidation,
  productIdValidation,
  productPayloadValidation,
  userIdValidation,
} from "./validators.js";

const router = Router();

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required"),
    body("password").isString().isLength({ min: 6 }).withMessage("Password is required"),
  ],
  validateRequest,
  login
);

router.get("/session", authenticateToken, me);
router.use(authenticateToken, requireRole("super_admin", "admin"));

router.get("/dashboard", getDashboardStats);

router.get("/products", listProducts);
router.get("/inventory", listInventory);
router.post("/products", productPayloadValidation, validateRequest, createProduct);
router.put("/products/:id", [...productIdValidation, ...productPayloadValidation], validateRequest, updateProduct);
router.delete("/products/:id", productIdValidation, validateRequest, deleteProduct);
router.patch(
  "/products/:id/publish",
  [
    ...productIdValidation,
    body("published").isBoolean().withMessage("published must be boolean"),
  ],
  validateRequest,
  publishProduct
);

router.get("/orders", listOrders);
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
  updateOrderStatus
);

router.get("/customers", listCustomers);

router.get("/pending-changes", listPendingChanges);
router.post(
  "/pending-changes/:id/approve",
  [
    ...changeIdValidation,
    body("entityType")
      .optional()
      .isIn(["product", "order", "customer"])
      .withMessage("entityType must be product, order, or customer"),
  ],
  validateRequest,
  approveChange
);
router.post(
  "/pending-changes/:id/reject",
  [
    ...changeIdValidation,
    body("entityType")
      .optional()
      .isIn(["product", "order", "customer"])
      .withMessage("entityType must be product, order, or customer"),
    body("reason").optional().isString().isLength({ max: 500 }),
  ],
  validateRequest,
  rejectChange
);

router.get("/users", requireRole("super_admin"), listUsers);
router.get("/role-management", requireRole("super_admin"), getRoleManagementOverview);
router.post(
  "/users",
  requireRole("super_admin"),
  [
    body("name").trim().isLength({ min: 2, max: 120 }),
    body("email").isEmail(),
    body("password").isLength({ min: 8 }),
    body("role").isIn([...USER_ROLE_VALUES, "user"]),
    body("status").optional().isIn(["active", "suspended", "disabled"]),
  ],
  validateRequest,
  createUser
);
router.patch(
  "/users/:id",
  requireRole("super_admin"),
  [
    ...userIdValidation,
    body("name").optional().trim().isLength({ min: 2, max: 120 }),
    body("email").optional().isEmail(),
  ],
  validateRequest,
  updateUserProfile
);
router.patch(
  "/users/:id/role",
  requireRole("super_admin"),
  [...userIdValidation, body("role").isIn([...USER_ROLE_VALUES, "user"])],
  validateRequest,
  updateUserRole
);
router.patch(
  "/users/:id/status",
  requireRole("super_admin"),
  [...userIdValidation, body("status").isIn(["active", "suspended", "disabled"])],
  validateRequest,
  updateUserStatus
);
router.post(
  "/users/:id/reset-password",
  requireRole("super_admin"),
  [...userIdValidation, body("password").isString().isLength({ min: 8 })],
  validateRequest,
  resetUserPassword
);
router.delete("/users/:id", requireRole("super_admin"), userIdValidation, validateRequest, deleteUser);
router.post(
  "/delete-user",
  requireRole("super_admin"),
  [body("userId").isInt({ min: 1 }).withMessage("Valid userId is required")],
  validateRequest,
  deleteUserByBody
);

router.get("/payment-settings", requireRole("super_admin"), getPaymentSettings);
router.patch(
  "/payment-settings",
  requireRole("super_admin"),
  [
    body("currency").optional().isLength({ min: 3, max: 3 }),
    body("gatewayMode").optional().isIn(["sandbox", "production"]),
    body("autoCapture").optional().isBoolean(),
    body("retryWindowMinutes").optional().isInt({ min: 1, max: 120 }),
  ],
  validateRequest,
  updatePaymentSettings
);

router.get("/api-keys", requireRole("super_admin"), listApiKeys);
router.post(
  "/api-keys",
  requireRole("super_admin"),
  [
    body("keyName").trim().isLength({ min: 2, max: 120 }),
    body("roleScope")
      .optional()
      .isIn(["super_admin", "admin", "development_team", "operator", "sales", "read_only"]),
  ],
  validateRequest,
  createApiKey
);
router.delete(
  "/api-keys/:id",
  requireRole("super_admin"),
  [param("id").isInt({ min: 1 }).withMessage("Valid api key id required")],
  validateRequest,
  revokeApiKey
);

router.get("/logs", requireRole("super_admin"), listAuditLogs);
router.get("/system-logs", requireRole("super_admin"), getSystemLogs);

export default router;
