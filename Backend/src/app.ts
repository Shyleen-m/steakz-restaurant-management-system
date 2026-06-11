import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// ROUTES
import authRoutes from "./routes/auth.routes.js";
import orderRoutes from "./routes/order.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import reservationRoutes from "./routes/reservation.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import staffRoutes from "./routes/staff.routes.js";
import branchRoutes from "./routes/branch.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import reorderRoutes from "./routes/reorder.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
const app = express();

// =====================================
// MIDDLEWARE
// =====================================

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
);

app.use(express.json());

app.use(cookieParser());

// =====================================
// HEALTH CHECK
// =====================================

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "API is running 🚀"
  });
});

// =====================================
// API ROUTES
// =====================================

app.use("/api/auth", authRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/reservations", reservationRoutes);

app.use("/api/inventory", inventoryRoutes);

app.use("/api/menu", menuRoutes);

app.use("/api/analytics", analyticsRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/staff", staffRoutes);

app.use("/api/branches", branchRoutes);

app.use('/api/payments', paymentRoutes);

app.use(
  "/api/reorder-requests",
  reorderRoutes
);
// =====================================
// 404 HANDLER
// =====================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});
app.use(errorHandler);
export default app;