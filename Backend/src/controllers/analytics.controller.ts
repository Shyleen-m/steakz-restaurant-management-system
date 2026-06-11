import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { isGlobalRole } from "../middleware/permissions.middleware.js";

export const getOperationalAnalytics = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const role = req.user?.role;
    const userBranchId = req.user?.branchId;
    const { days = 30, branchId } = req.query;

    const daysLimit = Number(days);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysLimit);

    const branches = await prisma.branch.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    });

    let branchFilter: any = {};

    if (!isGlobalRole(role)) {
      if (!userBranchId) {
        return res.status(403).json({ message: "No branch assigned" });
      }
      branchFilter = { branchId: userBranchId };
    }

    if (isGlobalRole(role)) {
      if (!branchId || branchId === "all") {
        branchFilter = {};
      }
      if (branchId && branchId !== "all") {
        branchFilter = { branchId: Number(branchId) };
      }
    }

    const orderFilter = {
      ...branchFilter,
      createdAt: { gte: startDate }
    };

    const [
      revenueStats,
      orderStatuses,
      reservations,
      lowStockItems,
      activeStaff,
      totalBranches,
      popularItems,
      orders,
      revenueTrendOrders,
      recentOrders
    ] = await Promise.all([
      prisma.order.aggregate({
        where: orderFilter,
        _sum: { total: true },
        _avg: { total: true },
        _count: { _all: true }
      }),

      prisma.order.groupBy({
        by: ["status"],
        where: orderFilter,
        _count: { _all: true }
      }),

      prisma.reservation.groupBy({
        by: ["status"],
        where: {
          ...branchFilter,
          reservationTime: { gte: startDate }
        },
        _count: { _all: true }
      }),

      prisma.inventory.count({
        where: {
          ...branchFilter,
          quantity: { lte: prisma.inventory.fields.minimumLevel }
        }
      }),

      prisma.user.count({
        where: {
          ...(isGlobalRole(role) ? branchFilter : { branchId: userBranchId }),
          isActive: true
        }
      }),

      prisma.branch.count(),

      prisma.orderItem.groupBy({
        by: ["menuItemId"],
        where: { order: orderFilter },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5
      }),

      prisma.order.findMany({
        where: orderFilter,
        select: { createdAt: true }
      }),

      prisma.order.findMany({
        where: orderFilter,
        select: { total: true, createdAt: true }
      }),

      // ✅ RECENT ACTIVITY — powers the live feed
      prisma.order.findMany({
        where: orderFilter,
        include: {
          branch: { select: { name: true } },
          items: {
            include: { menuItem: { select: { name: true } } },
            take: 1
          }
        },
        orderBy: { createdAt: "desc" },
        take: 10
      })
    ]);

    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: popularItems.map(item => item.menuItemId) } },
      select: { id: true, name: true, category: true }
    });

    const enrichedPopularItems = popularItems.map(item => ({
      menuItemId: item.menuItemId,
      quantity: item._sum.quantity || 0,
      name: menuItems.find(m => m.id === item.menuItemId)?.name || "Unknown",
      category: menuItems.find(m => m.id === item.menuItemId)?.category || "Unknown"
    }));

    const peakHours = orders.reduce((acc: any, curr) => {
      const hour = new Date(curr.createdAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    const peakHoursData = Object.entries(peakHours).map(([hour, count]) => ({
      hour,
      orders: count
    }));

    const revenueTrend = revenueTrendOrders.reduce((acc: any, order) => {
      const date = new Date(order.createdAt).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + Number(order.total);
      return acc;
    }, {});

    const revenueTrendData = Object.entries(revenueTrend).map(([date, revenue]) => ({
      date,
      revenue
    }));

    const kitchenStatusData = orderStatuses.map(status => ({
      status: status.status,
      count: status._count._all
    }));

    const reservationData = reservations.map(r => ({
      status: r.status,
      count: r._count._all
    }));

    let branchComparison: any[] = [];

    if (isGlobalRole(role)) {
      const branchStats = await prisma.branch.findMany({
        include: {
          orders: {
            where: { createdAt: { gte: startDate } }
          }
        }
      });

      branchComparison = branchStats.map(branch => ({
        branch: branch.name,
        revenue: branch.orders.reduce((sum, order) => sum + Number(order.total), 0),
        orders: branch.orders.length
      }));

      if (branchId && branchId !== "all") {
        branchComparison = branchComparison.filter(
          b => b.branch === branches.find(branch => branch.id === Number(branchId))?.name
        );
      }
    }

    // ✅ BUILD LIVE FEED from recent orders
    const recentActivity = recentOrders.map(order => ({
      type: "ORDER",
      message: `Table ${order.tableNumber} — ${
        order.items[0]?.menuItem?.name || "order"
      } · ${order.branch?.name || ""}`,
      status: order.status,
      time: order.createdAt
    }));

    return res.status(200).json({
      success: true,
      branches,
      reportingPeriod: `${daysLimit} days`,

      summary: {
        totalRevenue:       revenueStats._sum.total  || 0,
        averageOrderValue:  revenueStats._avg.total  || 0,
        totalOrders:        revenueStats._count._all || 0,
        activeStaff,
        lowStockItems,
        totalBranches
      },

      charts: {
        revenueTrend:    revenueTrendData,
        kitchenStatus:   kitchenStatusData,
        reservations:    reservationData,
        peakHours:       peakHoursData,
        branchComparison,
        recentActivity   // ✅ now included
      },

      insights: {
        popularItems: enrichedPopularItems,

        categoryPerformance: await (async () => {
          const categoryStats = await prisma.orderItem.groupBy({
            by: ["menuItemId"],
            where: { order: orderFilter },
            _sum: { quantity: true }
          });

          const menuItemsWithCategories = await prisma.menuItem.findMany({
            where: { id: { in: categoryStats.map(s => s.menuItemId) } },
            select: { id: true, category: true, price: true }
          });

          const distribution: Record<string, { revenue: number; count: number }> = {};

          categoryStats.forEach(stat => {
            const item = menuItemsWithCategories.find(m => m.id === stat.menuItemId);
            if (item) {
              const category = item.category || "Uncategorized";
              if (!distribution[category]) distribution[category] = { revenue: 0, count: 0 };
              const qty = stat._sum.quantity || 0;
              distribution[category].revenue += qty * item.price;
              distribution[category].count += qty;
            }
          });

          return Object.entries(distribution).map(([category, data]) => ({
            category,
            ...data
          }));
        })()
      }
    });

  } catch (error) {
    console.error("ANALYTICS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to load analytics" });
  }
};