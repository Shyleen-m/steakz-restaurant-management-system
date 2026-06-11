import express from "express";

import {
  createPayment
} from "../controllers/payment.controller.js";

import {
  protect
} from "../middleware/auth.middleware.js";

import {
  allowRoles
} from "../middleware/permissions.middleware.js";

const router =
  express.Router();

/**
 * CUSTOMER PAYMENT
 */
router.post(
  "/",
  protect,

  allowRoles(
    "CUSTOMER","WAITER"
  ),

  createPayment
);

export default router;

