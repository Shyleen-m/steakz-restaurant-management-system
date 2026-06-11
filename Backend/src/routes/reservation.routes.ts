import express from "express";

import {
  createReservation,
  getReservations,
  getSingleReservation,
  updateReservationStatus,
  deleteReservation
} from "../controllers/reservation.controller.js";

import {
  protect,
  optionalAuth
} from "../middleware/auth.middleware.js";

import {
  allowRoles
} from "../middleware/permissions.middleware.js";

import {
  validate
} from "../middleware/validate.middleware.js";

import {
  createReservationSchema
} from "../validators/index.js";

const router = express.Router();

/**
 * CREATE RESERVATION
 * Public + Logged In Customers
 */
router.post(
  "/",
  optionalAuth,
  validate(createReservationSchema),
  createReservation
);

/**
 * GET ALL RESERVATIONS
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

  getReservations
);

/**
 * GET SINGLE RESERVATION
 */
router.get(
  "/:id",
  protect,

  allowRoles(
    "CUSTOMER",
    "BRANCH_MANAGER",
    "KITCHEN_STAFF",
    "WAITER",
    "HEADQUARTERS_MANAGER",
    "ADMIN"
  ),

  getSingleReservation
);

/**
 * UPDATE RESERVATION STATUS
 */
router.patch(
  "/:id/status",
  protect,

  allowRoles(
    "BRANCH_MANAGER",
    "WAITER",
  ),

  updateReservationStatus
);

/**
 * DELETE RESERVATION
 */
router.delete(
  "/:id",
  protect,

  allowRoles(
    "BRANCH_MANAGER",
    "HEADQUARTERS_MANAGER",
    "ADMIN"
  ),

  deleteReservation
);

export default router;
