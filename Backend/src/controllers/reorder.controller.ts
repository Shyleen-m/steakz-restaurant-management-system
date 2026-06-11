import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { io } from "../index.js";
import { AppError } from "../middleware/error.middleware.js";

/**
 * CREATE REORDER REQUEST
 */
export const createReorderRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      inventoryId,
      quantity,
      note
    } = req.body;

    if (!inventoryId || !quantity) {
      return res.status(400).json({
        message: "Inventory item and quantity are required"
      });
    }

    const inventory = await prisma.inventory.findUnique({
      where: {
        id: inventoryId
      }
    });
    if (
  inventory?.branchId !==
  req.user?.branchId
) {
  throw new AppError(
    'Cannot request inventory from another branch',
    403
  );
}

    if (!inventory) {
      return res.status(404).json({
        message: "Inventory item not found"
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const reorderRequest =
      await prisma.reorderRequest.create({
        data: {
          inventoryId,
          quantity,
          note,

          branchId: inventory.branchId,

          requestedById: req.user.id
        },

        include: {
          inventory: true,
          branch: true,
          requestedBy: true
        }
      });

    // 🔴 REALTIME EVENT
    io.to(`branch_${inventory.branchId}`)
      .to("global_analytics")
      .emit("reorder:created", reorderRequest);

    return res.status(201).json({
      message: "Reorder request created successfully",
      reorderRequest
    });
  } catch (error) {
    console.error(
      "CREATE REORDER REQUEST ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create reorder request"
    });
  }
};

/**
 * GET REORDER REQUESTS
 */
export const getReorderRequests = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const where: any = {};

    // Branch isolation
    if (
  req.user?.role === "BRANCH_MANAGER"
) {
      if (!req.user?.branchId) {
        return res.status(403).json({
          message: "No branch assigned"
        });
      }

      where.branchId = req.user.branchId;
    }

    const requests =
      await prisma.reorderRequest.findMany({
        where,

        include: {
          inventory: true,
          branch: true,
          requestedBy: true
        },

        orderBy: {
          createdAt: "desc"
        }
      });

    return res.status(200).json({
      total: requests.length,
      requests
    });
  } catch (error) {
    console.error(
      "GET REORDER REQUESTS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch reorder requests"
    });
  }
};

/**
 * UPDATE REORDER STATUS
 */
export const updateReorderStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    const existingRequest =
      await prisma.reorderRequest.findUnique({
        where: {
          id
        },

        include: {
          inventory: true
        }
      });

    if (!existingRequest) {
      return res.status(404).json({
        message: "Reorder request not found"
      });
    }

    // UPDATE REQUEST STATUS
    const updatedRequest =
      await prisma.reorderRequest.update({
        where: {
          id
        },

        data: {
          status
        },

        include: {
          inventory: true,
          branch: true,
          requestedBy: true
        }
      });

    // =========================================
    // 🔥 AUTO INVENTORY FULFILLMENT
    // =========================================
    if (
  existingRequest.status ===
  "FULFILLED"
) {
  return res.status(400).json({
    message:
      "Request already fulfilled"
  });
}
    if (status === "FULFILLED") {
      const previousQuantity =
        existingRequest.inventory.quantity;

      const newQuantity =
        previousQuantity +
        existingRequest.quantity;

      // UPDATE INVENTORY
      const updatedInventory =
        await prisma.inventory.update({
          where: {
            id: existingRequest.inventoryId
          },

          data: {
            quantity: newQuantity
          }
        });

      // CREATE INVENTORY LOG
      await prisma.inventoryLog.create({
        data: {
          inventoryId:
            existingRequest.inventoryId,

          changedById: req.user!.id,

          action: "RESTOCK",

          previousQuantity,

          newQuantity,

          note: `Reorder fulfilled (+${existingRequest.quantity})`
        }
      });

      // 🔴 REALTIME INVENTORY UPDATE
      io.to(
        `branch_${updatedInventory.branchId}`
      )
        .to("global_analytics")
        .emit(
          "inventory:updated",
          updatedInventory
        );
    }

    // 🔴 REALTIME REORDER UPDATE
    io.to(
      `branch_${updatedRequest.branchId}`
    )
      .to("global_analytics")
      .emit(
        "reorder:updated",
        updatedRequest
      );

    return res.status(200).json({
      message:
        "Reorder request updated successfully",

      reorderRequest: updatedRequest
    });
  } catch (error) {
    console.error(
      "UPDATE REORDER STATUS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update reorder request"
    });
  }
};

/**
 * DELETE REORDER REQUEST
 */
export const deleteReorderRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const existingRequest =
      await prisma.reorderRequest.findUnique({
        where: {
          id
        }
      });

    if (!existingRequest) {
      return res.status(404).json({
        message: "Reorder request not found"
      });
    }

    await prisma.reorderRequest.delete({
      where: {
        id
      }
    });

    io.to(`branch_${existingRequest.branchId}`)
      .to("global_analytics")
      .emit("reorder:deleted", id);

    return res.status(200).json({
      message:
        "Reorder request deleted successfully"
    });
  } catch (error) {
    console.error(
      "DELETE REORDER REQUEST ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to delete reorder request"
    });
  }
};