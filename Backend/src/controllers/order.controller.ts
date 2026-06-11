import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../config/prisma.js";
import { io } from "../index.js";
import { canAccessBranch } from "../middleware/permissions.middleware.js";

/**
 * CREATE ORDER
 */
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { tableNumber, items, branchId, orderType, guestCount } = req.body;

    if (!tableNumber || !items?.length) {
      return res.status(400).json({ message: "Table number and items are required" });
    }

    const orderBranchId = Number(req.user?.branchId || branchId);
    if (!orderBranchId) {
      return res.status(400).json({ message: "Branch ID is required" });
    }

    let total = 0;

    const orderItemsData = await Promise.all(
      items.map(async (item: any) => {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId },
          include: { branch: true }
        });

        if (!menuItem) throw new Error(`Menu item not found: ${item.menuItemId}`);

        if (menuItem.branchId !== null && menuItem.branchId !== orderBranchId) {
          throw new Error(`${menuItem.name} belongs to another branch`);
        }

        const itemTotal = menuItem.price * item.quantity;
        total += itemTotal;

        return { menuItemId: menuItem.id, quantity: item.quantity, price: menuItem.price };
      })
    );

    const order = await prisma.order.create({
      data: {
        tableNumber: Number(tableNumber),
        total,
        status: "PENDING_PAYMENT",
        orderType: orderType || "DINE_IN",
        guestCount: Number(guestCount) || 1,
        branch: { connect: { id: orderBranchId } },
        ...(req.user?.role === "CUSTOMER" && {
          customer: { connect: { id: req.user.id } }
        }),
        ...(req.user?.role !== "CUSTOMER" && req.user?.id && {
          staff: { connect: { id: req.user.id } }
        }),
        items: { create: orderItemsData }
      },
      include: {
        customer: true,
        staff: true,
        branch: true,
        items: { include: { menuItem: true } }
      }
    });

    console.log(`[Socket] Emitting order:created to branch_${order.branchId}`);
    io.to(`branch_${order.branchId}`).to("global_analytics").emit("order:created", order);

    if (order.customerId) {
      io.to(`customer_${order.customerId}`).emit("customer:order_created", order);
    }

    return res.status(201).json({ message: "Order created successfully", order });
  } catch (error: any) {
    console.error("CREATE ORDER ERROR:", error);
    return res.status(500).json({ message: error.message || "Failed to create order" });
  }
};

/**
 * GET ORDERS
 */
export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const where: any = {};

    if (req.user?.role === "CUSTOMER") {
      where.customerId = req.user.id;
    } else if (req.user?.role !== "HEADQUARTERS_MANAGER" && req.user?.role !== "ADMIN") {
      if (!req.user?.branchId) {
        return res.status(403).json({ message: "No branch assigned" });
      }
      where.branchId = req.user.branchId;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        staff: true,
        branch: true,
        items: { include: { menuItem: true } },
        payment: true,
        receipt: true
      },
      orderBy: { createdAt: "desc" }
    });

    const enrichedOrders = orders.map(order => {
      const now = new Date();
      const createdAt = new Date(order.createdAt);
      const updatedAt = new Date(order.updatedAt);
      
      let waitDuration = 0;
      let totalPrepTime: number | null = null;

      if (["PENDING_PAYMENT", "PAID", "PREPARING", "READY"].includes(order.status)) {
        waitDuration = Math.floor((now.getTime() - createdAt.getTime()) / 1000); // seconds
      }

      if (["SERVED", "COMPLETED"].includes(order.status)) {
        totalPrepTime = Math.floor((updatedAt.getTime() - createdAt.getTime()) / 1000); // seconds
      }

      return {
        ...order,
        metadata: {
          waitDuration,
          totalPrepTime,
          isDelayed: waitDuration > 1800 // 30 mins threshold
        }
      };
    });

    return res.status(200).json({ total: orders.length, orders: enrichedOrders });
  } catch (error) {
    console.error("FETCH ORDERS ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/**
 * GET SINGLE ORDER
 */
export const getSingleOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: {
  id: String(req.params.id)
},
      include: {
        customer: true,
        staff: true,
        branch: true,
        items: { include: { menuItem: true } },
        payment: true,
        receipt: true
      }
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (req.user?.role === "CUSTOMER") {
      if (order.customerId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else if (!canAccessBranch(req.user, order.branchId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const now = new Date();
    const createdAt = new Date(order.createdAt);
    const updatedAt = new Date(order.updatedAt);
    
    let waitDuration = 0;
    let totalPrepTime: number | null = null;

    if (["PENDING_PAYMENT", "PAID", "PREPARING", "READY"].includes(order.status)) {
      waitDuration = Math.floor((now.getTime() - createdAt.getTime()) / 1000);
    }

    if (["SERVED", "COMPLETED"].includes(order.status)) {
      totalPrepTime = Math.floor((updatedAt.getTime() - createdAt.getTime()) / 1000);
    }

    return res.json({
      ...order,
      metadata: {
        waitDuration,
        totalPrepTime,
        isDelayed: waitDuration > 1800
      }
    });
  } catch (error) {
    console.error("FETCH ORDER ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch order" });
  }
};

/**
 * UPDATE ORDER STATUS
 * — On SERVED: auto-deduct inventory via MenuItemIngredient links
 */
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: String(req.params.id) },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                ingredients: {
                  include: { inventory: true }
                }
              }
            }
          }
        }
      }
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!canAccessBranch(req.user, order.branchId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (req.user?.role === "CUSTOMER") {
      return res.status(403).json({ message: "Customers cannot update orders" });
    }

    if (req.user?.role === "KITCHEN_STAFF") {
      if (!["PREPARING", "READY"].includes(status)) {
        return res.status(403).json({ message: "Kitchen staff cannot set this status" });
      }
    }

    if (req.user?.role === "WAITER") {
      if (!["SERVED", "COMPLETED"].includes(status)) {
        return res.status(403).json({ message: "Waiter cannot set this status" });
      }
    }

    const updated = await prisma.order.update({
      where: { id: String(req.params.id) },
      data: { status },
      include: {
        customer: true,
        staff: true,
        branch: true,
        items: { include: { menuItem: true } }
      }
    });

    /**
     * AUTO-DEDUCT INVENTORY ON SERVED
     * Uses MenuItemIngredient.quantityNeeded × orderItem.quantity
     */
    if (status === "SERVED") {
      for (const orderItem of order.items) {
        const ingredients = orderItem.menuItem.ingredients;

        for (const ingredient of ingredients) {
          const deductAmount = ingredient.quantityNeeded * orderItem.quantity;
          const inv = ingredient.inventory;

          if (!inv) continue;

          const newQty = Math.max(0, inv.quantity - deductAmount);

          await prisma.inventory.update({
            where: { id: inv.id },
            data: { quantity: newQty }
          });

          await prisma.inventoryLog.create({
            data: {
              inventoryId: inv.id,
              action: "USAGE",
              previousQuantity: inv.quantity,
              newQuantity: newQty,
              changedById: req.user?.id,
              note: `Auto-deducted for order #${order.id.slice(-6)} — ${orderItem.menuItem.name} ×${orderItem.quantity}`
            }
          });
        }
      }

      console.log(`[Inventory] Deducted stock for order ${req.params.id}`);

      // Notify inventory dashboards
      io.to(`branch_${updated.branchId}`).emit("inventory:updated", {
        branchId: updated.branchId,
        orderId: updated.id
      });
    }

    io.to(`branch_${updated.branchId}`).to("global_analytics").emit("order:updated", updated);

    if (updated.customerId) {
      io.to(`customer_${updated.customerId}`).emit("customer:order_updated", updated);
    }

    return res.json({ message: "Order status updated successfully", order: updated });
  } catch (error) {
    console.error("UPDATE ORDER ERROR:", error);
    return res.status(500).json({ message: "Failed to update order status" });
  }
};

/**
 * DELETE ORDER
 */
export const deleteOrder = async (
req: AuthRequest,
res: Response
) => {
try {
const id = String(req.params.id);

const order = await prisma.order.findUnique({
  where: { id }
});

if (!order) {
  return res.status(404).json({
    message: "Order not found"
  });
}

if (!canAccessBranch(req.user, order.branchId)) {
  return res.status(403).json({
    message: "Access denied"
  });
}

await prisma.orderItem.deleteMany({
  where: {
    orderId: id
  }
});

await prisma.order.delete({
  where: {
    id
  }
});

console.log(
  `[Socket] Emitting order:deleted to branch_${order.branchId}`
);

io.to(`branch_${order.branchId}`)
  .to("global_analytics")
  .emit("order:deleted", id);

return res.json({
  message: "Order deleted successfully"
});

} catch (error) {
console.error(
"DELETE ORDER ERROR:",
error
);

return res.status(500).json({
  message: "Failed to delete order"
});

}
};


/**
 * EXPORT ORDERS (CSV)
 */
export const exportOrders = async (req: AuthRequest, res: Response) => {
  try {
    const where: any = {};
    if (req.user?.role !== "HEADQUARTERS_MANAGER" && req.user?.role !== "ADMIN") {
      where.branchId = req.user.branchId;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        branch: true,
        items: { include: { menuItem: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    // Simple CSV Generation
    let csv = "Order ID,Date,Branch,Table,Guest Count,Total,Status,Items\n";
    
    orders.forEach(order => {
      const itemsList = order.items.map(i => `${i.menuItem.name} (x${i.quantity})`).join("; ");
      csv += `${order.id},${order.createdAt.toISOString()},${order.branch.name},${order.tableNumber},${order.guestCount},${order.total},${order.status},"${itemsList}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=orders-export-${new Date().getTime()}.csv`);
    
    return res.status(200).send(csv);
  } catch (error) {
    console.error("EXPORT ORDERS ERROR:", error);
    return res.status(500).json({ message: "Failed to export orders" });
  }
};