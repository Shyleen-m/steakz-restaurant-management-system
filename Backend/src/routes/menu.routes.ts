import express from "express";

import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from "../controllers/menu.controller.js";

import {
  protect
} from "../middleware/auth.middleware.js";

import {
  allowRoles
} from "../middleware/permissions.middleware.js";

const router = express.Router();

/**
 * PUBLIC MENU
 */
router.get("/", getMenuItems);

/**
 * CREATE MENU ITEM
 */
router.post(
  "/",
  protect,
  allowRoles(
    "ADMIN",
    "BRANCH_MANAGER"
  ),
  createMenuItem
);

/**
 * UPDATE MENU ITEM
 */
router.patch(
  "/:id",
  protect,
  allowRoles(
    "ADMIN",
    "BRANCH_MANAGER"
  ),
  updateMenuItem
);

/**
 * DELETE MENU ITEM
 */
router.delete(
  "/:id",
  protect,
  allowRoles(
    "ADMIN",
    "BRANCH_MANAGER"
  ),
  deleteMenuItem
);

export default router;