import { Router } from "express";
import { body } from "express-validator";
import {
  customerSession,
  signinCustomer,
  signupCustomer,
} from "../controllers/customerAuthController.js";
import { authenticateCustomerToken } from "../middleware/authenticateCustomerToken.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

const phoneRegex = /^\+?[0-9\s()\-]{7,20}$/;

router.post(
  "/signup",
  [
    body("fullName").trim().isLength({ min: 2, max: 120 }).withMessage("Full name is required"),
    body("companyName").optional({ nullable: true }).trim().isLength({ max: 160 }),
    body("phoneNumber")
      .trim()
      .matches(phoneRegex)
      .withMessage("A valid phone number is required"),
    body("email").isEmail().withMessage("A valid email is required"),
    body("password")
      .isString()
      .isLength({ min: 6, max: 100 })
      .withMessage("Password must be at least 6 characters"),
    body("confirmPassword")
      .isString()
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Passwords do not match"),
  ],
  validateRequest,
  signupCustomer
);

router.post(
  "/signin",
  [
    body("email").isEmail().withMessage("A valid email is required"),
    body("password")
      .isString()
      .isLength({ min: 6, max: 100 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validateRequest,
  signinCustomer
);

router.get("/me", authenticateCustomerToken, customerSession);

export default router;
