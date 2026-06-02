import { isDatabaseConnectionError } from "../config/db.js";
import {
  createCustomerAccount,
  findCustomerAccountByEmail,
  findCustomerAccountById,
} from "../models/customerAccountModel.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signCustomerToken } from "../utils/jwt.js";

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function sanitizeCustomer(account) {
  if (!account) {
    return null;
  }

  return {
    id: Number(account.id),
    customer_id: Number(account.customer_id),
    name: account.name,
    company: account.company,
    phone: account.phone,
    email: account.email,
    account_type: account.account_type || "customer",
    status: account.status || "active",
    created_at: account.created_at,
    updated_at: account.updated_at,
  };
}

export async function signupCustomer(req, res, next) {
  try {
    const payload = {
      name: String(req.body.fullName || "").trim(),
      company: req.body.companyName ? String(req.body.companyName).trim() : null,
      phone: String(req.body.phoneNumber || "").trim(),
      email: normalizeEmail(req.body.email),
      account_type: "customer",
    };
    const password = String(req.body.password || "");

    const passwordHash = await hashPassword(password);

    const result = await createCustomerAccount({
      ...payload,
      password: passwordHash,
    });

    if (result.duplicate) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const account = await findCustomerAccountById(result.accountId);
    const token = signCustomerToken(account);

    return res.status(201).json({
      token,
      customer: sanitizeCustomer(account),
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return res.status(503).json({ message: "Database connection failed" });
    }

    return next(error);
  }
}

export async function signinCustomer(req, res, next) {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    const account = await findCustomerAccountByEmail(email);
    if (!account) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (String(account.status || "active").toLowerCase() !== "active") {
      return res.status(403).json({ message: "This customer account is inactive." });
    }

    const isValid = await verifyPassword(password, account.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signCustomerToken(account);

    return res.json({
      token,
      customer: sanitizeCustomer(account),
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return res.status(503).json({ message: "Database connection failed" });
    }

    return next(error);
  }
}

export async function customerSession(req, res, next) {
  try {
    const account = await findCustomerAccountById(req.customer.id);
    if (!account) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.json({ customer: sanitizeCustomer(account) });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return res.status(503).json({ message: "Database connection failed" });
    }

    return next(error);
  }
}
