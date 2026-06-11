import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { io } from "../index.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  canAccessBranch,
  isGlobalRole
} from "../middleware/permissions.middleware.js";
import { InventoryLogAction } from "@prisma/client";

/**
 * GET INVENTORY
 */
export const getInventory = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    let whereClause: any = {};

    if (
      !isGlobalRole(req.user?.role)
    ) {

      if (!req.user?.branchId) {

        return res.status(403).json({
          message: "No branch assigned"
        });
      }

      whereClause.branchId =
        req.user.branchId;
    }

    const inventory =
      await prisma.inventory.findMany({
        where: whereClause,

        include: {
          branch: true,

          _count: {
            select: {
              logs: true
            }
          }
        },

        orderBy: {
          quantity: "asc"
        }
      });

    return res.status(200).json({
      total: inventory.length,
      inventory
    });

  } catch (error) {

    console.error(
      "FETCH INVENTORY ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch inventory"
    });
  }
};

/**
 * GET LOW / CRITICAL STOCK
 */
export const getLowStockItems =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      let whereClause: any = {};

      if (
        !isGlobalRole(req.user?.role)
      ) {

        whereClause.branchId =
          req.user?.branchId;
      }

      const inventory =
        await prisma.inventory.findMany({
          where: whereClause,

          include: {
            branch: true
          }
        });

      const criticalStock =
        inventory.filter(
          item =>
            item.quantity <=
            item.criticalLevel
        );

      const lowStock =
        inventory.filter(
          item =>
            item.quantity >
              item.criticalLevel &&
            item.quantity <=
              item.minimumLevel
        );

      return res.status(200).json({

        summary: {
          criticalCount:
            criticalStock.length,

          lowCount:
            lowStock.length
        },

        criticalStock,
        lowStock
      });

    } catch (error) {

      console.error(
        "FETCH LOW STOCK ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch low stock items"
      });
    }
  };

/**
 * ADJUST STOCK
 */
export const adjustStock =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const inventoryId =
        req.params.inventoryId as string;

      const {
        quantityChange,
        action,
        note
      } = req.body;

      if (
        quantityChange ===
          undefined ||
        !action
      ) {

        return res.status(400).json({
          message:
            "quantityChange and action are required"
        });
      }

      const allowedActions:
        InventoryLogAction[] = [
        "RESTOCK",
        "WASTAGE",
        "ADJUSTMENT",
        "USAGE"
      ];

      if (
        !allowedActions.includes(
          action as InventoryLogAction
        )
      ) {

        return res.status(400).json({
          message:
            "Invalid inventory action"
        });
      }

      const inventory =
        await prisma.inventory.findUnique({
          where: {
            id: inventoryId
          }
        });

      if (!inventory) {

        return res.status(404).json({
          message:
            "Inventory item not found"
        });
      }

      if (
        !canAccessBranch(
          req.user,
          inventory.branchId
        )
      ) {

        return res.status(403).json({
          message:
            "Access denied"
        });
      }

      const newQuantity =
        inventory.quantity +
        Number(quantityChange);

      const updated =
        await prisma.inventory.update({
          where: {
            id: inventoryId
          },

          data: {
            quantity:
              newQuantity
          },

          include: {
            branch: true
          }
        });

      await prisma.inventoryLog.create({
        data: {
          inventoryId,

          action:
            action as InventoryLogAction,

          previousQuantity:
            inventory.quantity,

          newQuantity,

          changedById:
            req.user?.id,

          note:
            note ||
            `Stock ${action.toLowerCase()} by ${req.user?.role}`
        }
      });

      if (
        newQuantity <=
        updated.minimumLevel
      ) {

        const alertType =
          newQuantity <=
          updated.criticalLevel
            ? "inventory:critical"
            : "inventory:low";

        io.to(
          `branch_${updated.branchId}`
        )
          .to("global_analytics")
          .emit(alertType, {

            itemId:
              updated.id,

            name:
              updated.name,

            quantity:
              newQuantity,

            unit:
              updated.unit,

            branchId:
              updated.branchId
          });
      }

      return res.status(200).json({

        message:
          `Inventory ${action.toLowerCase()} successful`,

        inventory: updated
      });

    } catch (error) {

      console.error(
        "ADJUST STOCK ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to adjust stock"
      });
    }
  };

/**
 * GET INVENTORY LOGS
 */
export const getInventoryLogs =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const inventoryId =
        req.params.inventoryId as string;

      let whereClause: any = {};

      if (inventoryId) {

        whereClause.inventoryId =
          inventoryId;
      }

      if (
        !isGlobalRole(req.user?.role)
      ) {

        whereClause.inventory = {
          branchId:
            req.user?.branchId
        };
      }

      const logs =
        await prisma.inventoryLog.findMany({

          where: whereClause,

          include: {

            inventory: {
              select: {
                name: true,
                unit: true,
                branch: true
              }
            },

            changedBy: {
              select: {
                fullName: true,
                role: true
              }
            }
          },

          orderBy: {
            createdAt: "desc"
          },

          take: 50
        });

      return res.status(200).json({
        total: logs.length,
        logs
      });

    } catch (error) {

      console.error(
        "FETCH LOGS ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch logs"
      });
    }
  };

/**
 * CREATE INVENTORY ITEM
 */
export const createInventoryItem =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const {
        name,
        quantity,
        minimumLevel,
        criticalLevel,
        unit,
        branchId
      } = req.body;

      if (
        !name ||
        quantity === undefined ||
        minimumLevel === undefined ||
        !unit
      ) {

        return res.status(400).json({
          message:
            "Missing required fields"
        });
      }

      const targetBranchId =
        branchId ||
        req.user?.branchId;

      if (!targetBranchId) {

        return res.status(400).json({
          message:
            "Branch assignment required"
        });
      }

      if (
        !canAccessBranch(
          req.user,
          Number(targetBranchId)
        )
      ) {

        return res.status(403).json({
          message:
            "Access denied"
        });
      }

      const inventory =
        await prisma.inventory.create({

          data: {
            name,

            quantity,

            minimumLevel,

            criticalLevel:
              criticalLevel || 0,

            unit,

            branchId:
              Number(targetBranchId)
          },

          include: {
            branch: true
          }
        });

      return res.status(201).json({

        message:
          "Inventory item created successfully",

        inventory
      });

    } catch (error) {

      console.error(
        "CREATE INVENTORY ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to create inventory item"
      });
    }
  };

/**
 * UPDATE INVENTORY
 */
export const updateInventory =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const id =
        req.params.id as string;

      const {
        name,
        minimumLevel,
        criticalLevel
      } = req.body;

      const inventory =
        await prisma.inventory.findUnique({
          where: {
            id
          }
        });

      if (!inventory) {

        return res.status(404).json({
          message:
            "Inventory item not found"
        });
      }

      if (
        !canAccessBranch(
          req.user,
          inventory.branchId
        )
      ) {

        return res.status(403).json({
          message:
            "Access denied"
        });
      }

      const updated =
        await prisma.inventory.update({

          where: {
            id
          },

          data: {

            name:
              name ||
              inventory.name,

            minimumLevel:
              minimumLevel !== undefined
                ? minimumLevel
                : inventory.minimumLevel,

            criticalLevel:
              criticalLevel !== undefined
                ? criticalLevel
                : inventory.criticalLevel
          },

          include: {
            branch: true
          }
        });

      return res.status(200).json({

        message:
          "Inventory item updated successfully",

        inventory: updated
      });

    } catch (error) {

      console.error(
        "UPDATE INVENTORY ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update inventory"
      });
    }
  };

/**
 * DELETE INVENTORY ITEM
 */
export const deleteInventoryItem =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const id =
        req.params.id as string;

      const inventory =
        await prisma.inventory.findUnique({
          where: {
            id
          }
        });

      if (!inventory) {

        return res.status(404).json({
          message:
            "Inventory item not found"
        });
      }

      if (
        !canAccessBranch(
          req.user,
          inventory.branchId
        )
      ) {

        return res.status(403).json({
          message:
            "Access denied"
        });
      }

      await prisma.inventoryLog.deleteMany({
        where: {
          inventoryId: id
        }
      });

      await prisma.inventory.delete({
        where: {
          id
        }
      });

      return res.status(200).json({
        message:
          "Inventory item deleted successfully"
      });

    } catch (error) {

      console.error(
        "DELETE INVENTORY ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to delete inventory"
      });
    }
  };

/**
 * INVENTORY SUMMARY
 */
export const getInventorySummary =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      let whereClause: any = {};

      if (
        !isGlobalRole(req.user?.role)
      ) {

        whereClause.branchId =
          req.user?.branchId;
      }

      const inventory =
        await prisma.inventory.findMany({

          where: whereClause,

          include: {
            branch: true
          }
        });

      const criticalItems =
        inventory.filter(
          item =>
            item.quantity <=
            item.criticalLevel
        );

      const lowStockItems =
        inventory.filter(
          item =>
            item.quantity <=
              item.minimumLevel &&
            item.quantity >
              item.criticalLevel
        );

      const recentMovements =
        await prisma.inventoryLog.findMany({

          take: 10,

          orderBy: {
            createdAt: "desc"
          },

          include: {

            inventory: {
              include: {
                branch: true
              }
            }
          }
        });

      return res.status(200).json({

        data: {

          totalItems:
            inventory.length,

          lowStockCount:
            lowStockItems.length +
            criticalItems.length,

          criticalItems,

          recentMovements:
            recentMovements.map(
              log => ({

                id: log.id,

                itemName:
                  log.inventory.name,

                quantity:
                  log.newQuantity -
                  log.previousQuantity,

                branchName:
                  log.inventory.branch
                    ?.name || "Unknown",

                type:
                  log.action ===
                  "RESTOCK"
                    ? "IN"
                    : "OUT",

                createdAt:
                  log.createdAt
              })
            )
        }
      });

    } catch (error) {

      console.error(
        "INVENTORY SUMMARY ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch inventory summary"
      });
    }
  };

/**
 * UPDATE INVENTORY ITEM
 */
export const updateInventoryItem =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const id =
        req.params.id as string;

      const {
        quantity,
        minimumLevel,
        criticalLevel
      } = req.body;

      const existing =
        await prisma.inventory.findUnique({
          where: {
            id
          }
        });

      if (!existing) {

        return res.status(404).json({
          message:
            "Inventory item not found"
        });
      }

      if (
        !canAccessBranch(
          req.user,
          existing.branchId
        )
      ) {

        return res.status(403).json({
          message:
            "Access denied"
        });
      }

      const updated =
        await prisma.inventory.update({

          where: {
            id
          },

          data: {

            ...(quantity !== undefined && {
              quantity:
                Number(quantity)
            }),

            ...(minimumLevel !== undefined && {
              minimumLevel:
                Number(minimumLevel)
            }),

            ...(criticalLevel !== undefined && {
              criticalLevel:
                Number(criticalLevel)
            })
          }
        });

      if (
        quantity !== undefined
      ) {

        await prisma.inventoryLog.create({

          data: {

            inventoryId: id,

            action:
              "ADJUSTMENT",

            previousQuantity:
              existing.quantity,

            newQuantity:
              Number(quantity),

            changedById:
              req.user?.id,

            note:
              "Manual adjustment via dashboard"
          }
        });
      }

      io.to(
        `branch_${existing.branchId}`
      ).emit(
        "inventory:updated",
        {
          branchId:
            existing.branchId
        }
      );

      return res.json({

        message:
          "Inventory updated",

        inventory: updated
      });

    } catch (error) {

      console.error(
        "UPDATE INVENTORY ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update inventory"
      });
    }
  };
