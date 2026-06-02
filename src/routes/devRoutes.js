import { Router } from "express";
import { body, param } from "express-validator";
import {
  clearCache,
  getApiRequestLogs,
  getBuildLogs,
  getDatabaseTableRows,
  getDatabaseTables,
  getFeatureFlags,
  getSystemLogs,
  getTechnicalDashboard,
  runReadOnlyQuery,
  updateFeatureFlag,
} from "../controllers/devController.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

router.use(authenticateToken, requireRole("development_team"));
router.get("/health", getTechnicalDashboard);

router.post("/cache/clear", clearCache);
router.get("/build-logs", getBuildLogs);
router.get("/api-requests", getApiRequestLogs);
router.get("/system-logs", getSystemLogs);

router.get("/feature-flags", getFeatureFlags);
router.patch(
  "/feature-flags/:flagKey",
  [
    param("flagKey").trim().isLength({ min: 2, max: 120 }),
    body("enabled").isBoolean().withMessage("enabled must be boolean"),
  ],
  validateRequest,
  updateFeatureFlag
);

router.get("/database/tables", getDatabaseTables);
router.get(
  "/database/tables/:tableName",
  [param("tableName").matches(/^[A-Za-z0-9_]+$/).withMessage("Valid table name is required")],
  validateRequest,
  getDatabaseTableRows
);
router.post(
  "/database/query",
  [body("sql").isString().isLength({ min: 1, max: 4000 })],
  validateRequest,
  runReadOnlyQuery
);

export default router;
