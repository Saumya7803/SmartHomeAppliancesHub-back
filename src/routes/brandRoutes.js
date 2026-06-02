import { Router } from "express";
import { body, param } from "express-validator";
import {
  createBrand,
  deleteBrand,
  listBrands,
  updateBrand,
} from "../controllers/brandController.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

router.get("/", listBrands);

router.post(
  "/",
  authenticateToken,
  requireRole("super_admin", "admin", "development_team", "operator"),
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 120 })
      .withMessage("Brand name must be between 2 and 120 characters"),
    body("logo")
      .optional({ nullable: true })
      .isString()
      .isLength({ max: 1000000 })
      .withMessage("Logo payload is too large"),
    body("description")
      .optional({ nullable: true })
      .isString()
      .isLength({ max: 2000 })
      .withMessage("Description can be at most 2000 characters"),
  ],
  validateRequest,
  createBrand
);

router.put(
  "/:id",
  authenticateToken,
  requireRole("super_admin", "admin", "development_team", "operator"),
  [
    param("id").isInt({ gt: 0 }).withMessage("Invalid brand id"),
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 120 })
      .withMessage("Brand name must be between 2 and 120 characters"),
    body("logo")
      .optional({ nullable: true })
      .isString()
      .isLength({ max: 1000000 })
      .withMessage("Logo payload is too large"),
    body("description")
      .optional({ nullable: true })
      .isString()
      .isLength({ max: 2000 })
      .withMessage("Description can be at most 2000 characters"),
  ],
  validateRequest,
  updateBrand
);

router.delete(
  "/:id",
  authenticateToken,
  requireRole("super_admin", "admin"),
  [param("id").isInt({ gt: 0 }).withMessage("Invalid brand id")],
  validateRequest,
  deleteBrand
);

export default router;
