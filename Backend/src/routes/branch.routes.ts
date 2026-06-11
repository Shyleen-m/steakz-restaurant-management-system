import express from "express";
import { prisma } from "../config/prisma.js";
import { protect } from "../middleware/auth.middleware.js";
import { hqOrAdminOnly } from "../middleware/permissions.middleware.js";

const router = express.Router();

/**
 * PUBLIC — GET ALL BRANCHES
 */
router.get("/", async (_req, res) => {
  try {
    const branches = await prisma.branch.findMany();

    res.json(branches);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch branches"
    });
  }
});

/**
 * PUBLIC — GET SINGLE BRANCH
 */
router.get("/:id", async (req, res) => {
  try {
    const branch = await prisma.branch.findFirst({
      where: {
        OR: [
          { id: Number(req.params.id) || undefined },
          { name: req.params.id }
        ]
      }
    });

    if (!branch) {
      return res.status(404).json({
        message: "Branch not found"
      });
    }

    res.json(branch);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch branch"
    });
  }
});

/**
 * PROTECTED ROUTES
 * HQ/Admin only
 */

/* Example future routes

router.post(
  "/",
  protect,
  hqOrAdminOnly,
  createBranch
);

router.patch(
  "/:id",
  protect,
  hqOrAdminOnly,
  updateBranch
);

router.delete(
  "/:id",
  protect,
  hqOrAdminOnly,
  deleteBranch
);

*/

export default router;