import express from "express";

import {
  createReorderRequest,
  getReorderRequests,
  updateReorderStatus,
  deleteReorderRequest
} from "../controllers/reorder.controller.js";

import { protect } from "../middleware/auth.middleware.js";

import {
  allowRoles
} from "../middleware/permissions.middleware.js";

const router = express.Router();

/**
 * ALL ROUTES PROTECTED
 */
router.use(protect);

/**
 * CREATE REQUEST
 * Branch managers & inventory managers
 */
router.post(
  "/",
  allowRoles(
  "BRANCH_MANAGER",
  "INVENTORY_MANAGER",
  "HEADQUARTERS_MANAGER",
  "ADMIN"
),
  createReorderRequest
);

/**
 * GET REQUESTS
 */
router.get(
  "/",
  allowRoles(
    "BRANCH_MANAGER",
    "INVENTORY_MANAGER",
    "HEADQUARTERS_MANAGER",
    "ADMIN"
  ),
  getReorderRequests
);

/**
 * UPDATE STATUS
 * Inventory/HQ/Admin only
 */
router.patch(
  "/:id",
  allowRoles(
    "INVENTORY_MANAGER",
    "HEADQUARTERS_MANAGER",
    "ADMIN"
  ),
  updateReorderStatus
);

/**
 * DELETE REQUEST
 */
router.delete(
  "/:id",
  allowRoles(
    "HEADQUARTERS_MANAGER",
    "ADMIN"
  ),
  deleteReorderRequest
);

export default router;