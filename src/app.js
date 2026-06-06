import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import customerAuthRoutes from "./routes/customerAuthRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import devRoutes from "./routes/devRoutes.js";
import operatorRoutes from "./routes/operatorRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandlers.js";
import { apiRequestLogger } from "./middleware/apiRequestLogger.js";

const app = express();
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again later." },
});

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.clientOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(apiRequestLogger);
app.use("/api", (req, res, next) => {
  // Keep read-heavy pages responsive while still throttling write traffic.
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    next();
    return;
  }

  apiLimiter(req, res, next);
});
app.use("/api/admin/login", authLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/customer-auth/signin", authLimiter);

app.get("/", (req, res) => {
  res.json({
    name: "SmartHome API",
    status: "ok",
    health: "/api/health",
    adminLogin: `${env.clientOrigins[0] || "http://127.0.0.1:5173"}/admin-login`,
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/customer-auth", customerAuthRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/products", publicRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dev", devRoutes);
app.use("/api/user", operatorRoutes);
app.use("/api/operator", operatorRoutes);
app.use("/api/sales", salesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
