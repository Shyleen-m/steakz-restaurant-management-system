import express from "express";

import { protect } from "../middleware/auth.middleware.js";

import { getAdminOverview } from "../controllers/admin.controller.js";

const router = express.Router();

router.get(
  "/overview",
  protect,
  getAdminOverview
);

export default router;