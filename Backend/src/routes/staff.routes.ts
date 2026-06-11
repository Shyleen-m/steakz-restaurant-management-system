import express from "express";

import {
  getStaff,
  toggleStaffStatus,
  deleteStaff
} from "../controllers/staff.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * GET STAFF
 */
router.get(
  "/",
  protect,
  getStaff
);

/**
 * TOGGLE STATUS
 */
router.patch(
  "/:id/toggle",
  protect,
  toggleStaffStatus
);

/**
 * DELETE STAFF
 */
router.delete(
  "/:id",
  protect,
  deleteStaff
);

export default router;
