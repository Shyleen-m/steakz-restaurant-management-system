import express from "express";

import {
  login,
  register,
  logout,
  getCurrentUser
} from "../controllers/auth.controller.js";

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
  registerSchema,
  loginSchema
} from "../validators/index.js";

const router = express.Router();

/**
 * =========================================
 * PUBLIC CUSTOMER REGISTER
 * =========================================
 */
router.post(
  "/register",
  validate(registerSchema),
  register
);

/**
 * =========================================
 * STAFF REGISTER
 * ADMIN + HQ ONLY
 * =========================================
 */
router.post(
  "/register/staff",

  protect,

  allowRoles(
    "ADMIN",
    "HEADQUARTERS_MANAGER"
  ),

  validate(registerSchema),

  register
);

/**
 * =========================================
 * LOGIN
 * =========================================
 */
router.post(
  "/login",
  validate(loginSchema),
  login
);

/**
 * =========================================
 * LOGOUT
 * =========================================
 */
router.post(
  "/logout",
  protect,
  logout
);

/**
 * =========================================
 * CURRENT USER
 * =========================================
 */
router.get(
  "/me",
  protect,
  getCurrentUser
);

/**
 * =========================================
 * HQ TEST
 * =========================================
 */
router.get(
  "/hq-dashboard",

  protect,

  allowRoles(
    "HEADQUARTERS_MANAGER"
  ),

  (_req, res) => {
    res.json({
      message: "Welcome Headquarters Manager"
    });
  }
);

/**
 * =========================================
 * ADMIN TEST
 * =========================================
 */
router.get(
  "/admin-dashboard",

  protect,

  allowRoles(
    "ADMIN"
  ),

  (_req, res) => {
    res.json({
      message: "Welcome Admin"
    });
  }
);

/**
 * =========================================
 * BRANCH MANAGER TEST
 * =========================================
 */
router.get(
  "/branch-dashboard",

  protect,

  allowRoles(
    "BRANCH_MANAGER"
  ),

  (_req, res) => {
    res.json({
      message: "Welcome Branch Manager"
    });
  }
);

/**
 * =========================================
 * KITCHEN STAFF TEST
 * =========================================
 */
router.get(
  "/kitchen-dashboard",

  protect,

  allowRoles(
    "KITCHEN_STAFF"
  ),

  (_req, res) => {
    res.json({
      message: "Welcome Kitchen Staff"
    });
  }
);

/**
 * =========================================
 * INVENTORY TEST
 * =========================================
 */
router.get(
  "/inventory-dashboard",

  protect,

  allowRoles(
    "INVENTORY_MANAGER"
  ),

  (_req, res) => {
    res.json({
      message: "Welcome Inventory Manager"
    });
  }
);

/**
 * =========================================
 * WAITER TEST
 * =========================================
 */
router.get(
  "/waiter-dashboard",

  protect,

  allowRoles(
    "WAITER"
  ),

  (_req, res) => {
    res.json({
      message: "Welcome Waiter"
    });
  }
);

/**
 * =========================================
 * CUSTOMER TEST
 * =========================================
 */
router.get(
  "/customer-dashboard",

  protect,

  allowRoles(
    "CUSTOMER"
  ),

  (_req, res) => {
    res.json({
      message: "Welcome Customer"
    });
  }
);

export default router;

