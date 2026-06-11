import express from "express";
import { getOperationalAnalytics } from "../controllers/analytics.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/permissions.middleware.js";

const router = express.Router();

/**
 * GET ANALYTICS REPORT
 * Restricted to Managers and Admins
 */
router.get(
  "/",
  protect,
  allowRoles("HEADQUARTERS_MANAGER", "BRANCH_MANAGER", "INVENTORY_MANAGER", "ADMIN"),
  getOperationalAnalytics
);

export default router;
