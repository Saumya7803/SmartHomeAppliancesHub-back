import { Router } from "express";
import { body } from "express-validator";
import { createCategory, listCategories } from "../controllers/categoryController.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

router.get("/", listCategories);

router.post(
  "/",
  authenticateToken,
  requireRole("super_admin", "admin", "development_team", "operator"),
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 120 })
      .withMessage("Category name must be between 2 and 120 characters"),
  ],
  validateRequest,
  createCategory
);

export default router;
