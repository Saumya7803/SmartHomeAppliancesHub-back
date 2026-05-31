import { Router } from "express";
import { body } from "express-validator";
import { login, me } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { validateRequest } from "../middleware/validateRequest.js";

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

router.get("/me", authenticateToken, me);

export default router;
