import express from "express";

import {
  getDashboardStats
} from "../controllers/dashboard.controller.js";

import {
  protect
} from "../middleware/auth.middleware.js";

import {
  allowRoles
} from "../middleware/permissions.middleware.js";

const router = express.Router();

/**
 * DASHBOARD
 */
router.get(
  "/",
  protect,

  allowRoles(
    "HEADQUARTERS_MANAGER",
    "BRANCH_MANAGER",
    "ADMIN",
    "INVENTORY_MANAGER",
    "KITCHEN_STAFF"
  ),

  getDashboardStats
);

export default router;