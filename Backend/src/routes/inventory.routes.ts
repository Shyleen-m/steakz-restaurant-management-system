import express from "express";

import {
  getInventory,
  getLowStockItems,
  getInventorySummary,
  adjustStock,
  getInventoryLogs,
  createInventoryItem,
  updateInventory,
  deleteInventoryItem
} from "../controllers/inventory.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { 
  allowRoles,
} from "../middleware/permissions.middleware.js";

import { validate } from "../middleware/validate.middleware.js";
import { adjustStockSchema } from "../validators/index.js";

const router = express.Router();

/**
 * GET ALL INVENTORY
 */
router.get(
  "/",
  protect,
  allowRoles("INVENTORY_MANAGER", "BRANCH_MANAGER", "KITCHEN_STAFF", "ADMIN", "HEADQUARTERS_MANAGER"),
  getInventory
);

/**
 * GET LOW STOCK
 */
router.get(
  "/low-stock",
  protect,
  allowRoles("INVENTORY_MANAGER", "BRANCH_MANAGER", "KITCHEN_STAFF", "ADMIN", "HEADQUARTERS_MANAGER"),
  getLowStockItems
);
/**
 * INVENTORY SUMMARY
 */
router.get(
  "/summary",
  protect,
  allowRoles(
    "INVENTORY_MANAGER",
    "BRANCH_MANAGER",
    "ADMIN",
    "HEADQUARTERS_MANAGER"
  ),
  getInventorySummary
);

/**
 * GET LOGS
 */
router.get(
  "/logs",
  protect,
  allowRoles("INVENTORY_MANAGER", "BRANCH_MANAGER", "ADMIN", "HEADQUARTERS_MANAGER"),
  getInventoryLogs
);

router.get(
  "/logs/:inventoryId",
  protect,
  allowRoles("INVENTORY_MANAGER", "BRANCH_MANAGER", "ADMIN", "HEADQUARTERS_MANAGER"),
  getInventoryLogs
);

/**
 * ADJUST STOCK (Restock, Wastage, Adjustment)
 */
router.post(
  "/:inventoryId/adjust",
  protect,
  allowRoles("INVENTORY_MANAGER", "BRANCH_MANAGER", "ADMIN"),
  validate(adjustStockSchema),
  adjustStock
);

/**
 * CREATE ITEM
 */
router.post(
  "/",
  protect,
  allowRoles("INVENTORY_MANAGER", "ADMIN"),
  createInventoryItem
);

/**
 * UPDATE ITEM (Meta)
 */
router.patch(
  "/:id",
  protect,
  allowRoles("INVENTORY_MANAGER", "ADMIN"),
  updateInventory
);

/**
 * DELETE ITEM
 */
router.delete(
  "/:id",
  protect,
  allowRoles("INVENTORY_MANAGER", "ADMIN"),
  deleteInventoryItem
);

export default router;
