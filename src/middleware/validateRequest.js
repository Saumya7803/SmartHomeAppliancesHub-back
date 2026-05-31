import { validationResult } from "express-validator";

export function validateRequest(req, res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array();
    return res.status(422).json({
      message: errors[0]?.msg || "Validation failed",
      errors,
    });
  }

  return next();
}
