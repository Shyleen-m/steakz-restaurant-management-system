import express from "express";

import {
  createOrder,
  getOrders,
  getSingleOrder,
  updateOrderStatus,
  deleteOrder,
  exportOrders
} from "../controllers/order.controller.js";

import {
  protect
} from "../middleware/auth.middleware.js";

import {
  allowRoles
} from "../middleware/permissions.middleware.js";

import {
  validate
} from "../middleware/validate.middleware.js";

import {
  createOrderSchema
} from "../validators/index.js";

const router = express.Router();

/**
 * EXPORT ORDERS
 */
router.get(
  "/export",
  protect,
  allowRoles("BRANCH_MANAGER", "HEADQUARTERS_MANAGER", "ADMIN"),
  exportOrders
);

/**
 * CREATE ORDER
 */
router.post(
  "/",
  protect,
  validate(createOrderSchema),
  createOrder
);

/**
 * GET ORDERS
 */
router.get(
  "/",
  protect,
  allowRoles(
    "CUSTOMER",
    "BRANCH_MANAGER",
    "KITCHEN_STAFF",
    "WAITER",
    "HEADQUARTERS_MANAGER",
    "ADMIN"
  ),
  getOrders
);

/**
 * GET SINGLE ORDER
 */
router.get(
  "/:id",
  protect,
  getSingleOrder
);

/**
 * UPDATE ORDER STATUS
 */
router.patch(
  "/:id/status",
  protect,
  allowRoles(
    "KITCHEN_STAFF",
    "WAITER",
    "BRANCH_MANAGER"
  ),
  updateOrderStatus
);

/**
 * DELETE ORDER
 */
router.delete(
  "/:id",
  protect,
  allowRoles(
    "BRANCH_MANAGER",
    "HEADQUARTERS_MANAGER",
    "ADMIN"
  ),
  deleteOrder
);

export default router;
