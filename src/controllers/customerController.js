import { isDatabaseConnectionError } from "../config/db.js";
import {
  findCustomerAccountById,
  listCustomerOrders,
  listCustomerQuotations,
  listCustomerSavedProducts,
  removeCustomerProduct,
  saveCustomerProduct,
  updateCustomerAccountById,
} from "../models/customerAccountModel.js";

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
    account_type: account.account_type,
    status: account.status,
    created_at: account.created_at,
    updated_at: account.updated_at,
  };
}

async function resolveCustomerOr404(customerAccountId, res) {
  const account = await findCustomerAccountById(customerAccountId);
  if (!account) {
    res.status(404).json({ message: "Customer account not found" });
    return null;
  }

  return account;
}

export async function getCustomerAccount(req, res, next) {
  try {
    const account = await resolveCustomerOr404(req.customer.id, res);
    if (!account) {
      return;
    }

    const [orders, quotations, savedProducts] = await Promise.all([
      listCustomerOrders(account.id),
      listCustomerQuotations(account.id),
      listCustomerSavedProducts(account.id),
    ]);

    return res.json({
      profile: sanitizeCustomer(account),
      orders,
      quotations,
      savedProducts,
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return res.status(503).json({ message: "Database connection failed" });
    }

    return next(error);
  }
}

export async function listMyOrders(req, res, next) {
  try {
    const account = await resolveCustomerOr404(req.customer.id, res);
    if (!account) {
      return;
    }

    const orders = await listCustomerOrders(account.id);
    return res.json({ orders });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return res.status(503).json({ message: "Database connection failed" });
    }

    return next(error);
  }
}

export async function listMyQuotations(req, res, next) {
  try {
    const account = await resolveCustomerOr404(req.customer.id, res);
    if (!account) {
      return;
    }

    const quotations = await listCustomerQuotations(account.id);
    return res.json({ quotations });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return res.status(503).json({ message: "Database connection failed" });
    }

    return next(error);
  }
}

export async function listMySavedProducts(req, res, next) {
  try {
    const account = await resolveCustomerOr404(req.customer.id, res);
    if (!account) {
      return;
    }

    const savedProducts = await listCustomerSavedProducts(account.id);
    return res.json({ savedProducts });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return res.status(503).json({ message: "Database connection failed" });
    }

    return next(error);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const account = await resolveCustomerOr404(req.customer.id, res);
    if (!account) {
      return;
    }

    await updateCustomerAccountById(account.id, {
      name: String(req.body.fullName || "").trim(),
      company: req.body.companyName ? String(req.body.companyName).trim() : null,
      phone: String(req.body.phoneNumber || "").trim(),
    });

    const updated = await findCustomerAccountById(account.id);

    return res.json({
      message: "Profile updated successfully",
      profile: sanitizeCustomer(updated),
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return res.status(503).json({ message: "Database connection failed" });
    }

    return next(error);
  }
}

export async function saveMyProduct(req, res, next) {
  try {
    const account = await resolveCustomerOr404(req.customer.id, res);
    if (!account) {
      return;
    }

    const productId = Number(req.params.productId);
    await saveCustomerProduct(account.id, productId);

    return res.status(201).json({ message: "Product saved successfully" });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return res.status(503).json({ message: "Database connection failed" });
    }

    return next(error);
  }
}

export async function removeMyProduct(req, res, next) {
  try {
    const account = await resolveCustomerOr404(req.customer.id, res);
    if (!account) {
      return;
    }

    const productId = Number(req.params.productId);
    await removeCustomerProduct(account.id, productId);

    return res.json({ message: "Saved product removed" });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return res.status(503).json({ message: "Database connection failed" });
    }

    return next(error);
  }
}
