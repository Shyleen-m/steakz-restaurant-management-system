import express from "express";

import {
  getUsers,
  updateUser,
  deactivateUser,
  activateUser,
  deleteUser
} from "../controllers/user.controller.js";

import { protect } from "../middleware/auth.middleware.js";

import {
  hqOrAdminOnly
} from "../middleware/permissions.middleware.js";

const router = express.Router();

/**
 * ALL ROUTES PROTECTED
 */
router.use(protect);

/**
 * HQ/Admin only
 */

/**
 * GET ALL USERS
 */
router.get(
  "/",
  hqOrAdminOnly,
  getUsers
);

/**
 * UPDATE USER
 */
router.patch(
  "/:id",
  hqOrAdminOnly,
  updateUser
);

/**
 * DEACTIVATE USER
 */
router.patch(
  "/:id/deactivate",
  hqOrAdminOnly,
  deactivateUser
);

/**
 * ACTIVATE USER
 */
router.patch(
  "/:id/activate",
  hqOrAdminOnly,
  activateUser
);

/**
 * DELETE USER
 */
router.delete(
  "/:id",
  hqOrAdminOnly,
  deleteUser
);

export default router;