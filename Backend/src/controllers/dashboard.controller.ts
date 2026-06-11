import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {

  try {

    const role =
      req.user?.role;

    const userBranchId =
      req.user?.branchId;

    // ==========================================
    // GUARD
    // ==========================================
    const branchRoles = [
      "BRANCH_MANAGER",
      "KITCHEN_STAFF",
      "WAITER"
    ];

    if (
      branchRoles.includes(role!) &&
      !userBranchId
    ) {

      return res.status(403).json({
        message:
          "No branch assigned"
      });
    }

    // ==========================================
    // BRANCH MANAGER DASHBOARD
    // ==========================================
    if (
      role === "BRANCH_MANAGER"
    ) {

      const today =
        new Date();

      const sevenDaysAgo =
        new Date();

      sevenDaysAgo.setDate(
        today.getDate() - 6
      );

      sevenDaysAgo.setHours(
        0,
        0,
        0,
        0
      );

      const [
        revenue,
        branchCounts,
        orders,
        reservations,
        inventoryAlerts,
        orderStatusBreakdown,
        reservationStatusBreakdown,
        topSellingStats
      ] = await Promise.all([

        prisma.order.aggregate({
          where: {
            branchId:
              userBranchId!
          },

          _sum: {
            total: true
          }
        }),

        prisma.branch.findUnique({
          where: {
            id:
              userBranchId!
          },

          select: {
            _count: {
              select: {
                orders: true,
                reservations: true
              }
            }
          }
        }),

        prisma.order.findMany({
          where: {
            branchId:
              userBranchId!,

            createdAt: {
              gte:
                sevenDaysAgo
            }
          },

          orderBy: {
            createdAt: "asc"
          }
        }),

        prisma.reservation.findMany({
          where: {
            branchId:
              userBranchId!
          }
        }),

        prisma.inventory.findMany({
          where: {
            branchId:
              userBranchId!,

            quantity: {
              lte: 10
            }
          }
        }),

        prisma.order.groupBy({
          by: ["status"],

          where: {
            branchId:
              userBranchId!
          },

          _count: {
            _all: true
          }
        }),

        prisma.reservation.groupBy({
          by: ["status"],

          where: {
            branchId:
              userBranchId!
          },

          _count: {
            _all: true
          }
        }),

        prisma.orderItem.groupBy({
          by: ["menuItemId"],

          where: {
            order: {
              branchId:
                userBranchId!,

              createdAt: {
                gte:
                  sevenDaysAgo
              }
            }
          },

          _sum: {
            quantity: true
          },

          orderBy: {
            _sum: {
              quantity:
                "desc"
            }
          },

          take: 5
        })
      ]);

      // ======================================
      // REAL REVENUE TREND
      // ======================================
      const dailyRevenueTrend: {
        day: string;
        revenue: number;
      }[] = [];

      const dailyOrderTrend: {
        day: string;
        orders: number;
      }[] = [];

      for (
        let i = 6;
        i >= 0;
        i--
      ) {

        const currentDay =
          new Date();

        currentDay.setDate(
          today.getDate() - i
        );

        currentDay.setHours(
          0,
          0,
          0,
          0
        );

        const nextDay =
          new Date(currentDay);

        nextDay.setDate(
          currentDay.getDate() +
            1
        );

        const dayOrders =
          orders.filter(
            (order) =>
              new Date(
                order.createdAt
              ) >= currentDay &&
              new Date(
                order.createdAt
              ) < nextDay
          );

        const revenueTotal =
          dayOrders.reduce(
            (sum, order) =>
              sum + order.total,
            0
          );

        dailyRevenueTrend.push({
          day:
            currentDay.toLocaleDateString(
              "en-GB",
              {
                weekday:
                  "short"
              }
            ),

          revenue:
            revenueTotal
        });

        dailyOrderTrend.push({
          day:
            currentDay.toLocaleDateString(
              "en-GB",
              {
                weekday:
                  "short"
              }
            ),

          orders:
            dayOrders.length
        });
      }

      // ======================================
      // TOP SELLING ITEMS
      // ======================================
      const topItemDetails =
        await prisma.menuItem.findMany({
          where: {
            id: {
              in:
                topSellingStats.map(
                  (
                    item: any
                  ) =>
                    item.menuItemId
                )
            }
          },

          select: {
            id: true,
            name: true,
            category: true,
            price: true
          }
        });

      const topSellingItems =
        topSellingStats.map(
          (item: any) => ({
            ...item,

            details:
              topItemDetails.find(
                (detail) =>
                  detail.id ===
                  item.menuItemId
              )
          })
        );

      const criticalAlerts =
        inventoryAlerts.filter(
          (item) =>
            item.quantity <=
            item.criticalLevel
        ).length;

      return res.status(200).json({

        dashboardType:
          "BRANCH_MANAGER",

        branchId:
          userBranchId,

        summary: {

          totalRevenue:
            revenue._sum.total ||
            0,

          totalOrders:
            branchCounts?._count
              .orders || 0,

          totalReservations:
            branchCounts?._count
              .reservations ||
            0,

          inventoryAlerts: {
            total:
              inventoryAlerts.length,

            critical:
              criticalAlerts
          },

          orderStatusBreakdown:
            orderStatusBreakdown.reduce(
              (
                acc: any,
                curr
              ) => {

                acc[
                  curr.status
                ] =
                  curr._count
                    ._all;

                return acc;
              },
              {}
            ),

          reservationStatusBreakdown:
            reservationStatusBreakdown.reduce(
              (
                acc: any,
                curr
              ) => {

                acc[
                  curr.status
                ] =
                  curr._count
                    ._all;

                return acc;
              },
              {}
            ),

          topSellingItems
        },

        dailyRevenueTrend,

        dailyOrderTrend,

        recentReservations:
          reservations
            .sort(
              (
                a,
                b
              ) =>
                new Date(
                  b.createdAt
                ).getTime() -
                new Date(
                  a.createdAt
                ).getTime()
            )
            .slice(0, 5)
      });
    }

    // ==========================================
    // HQ / ADMIN DASHBOARD
    // ==========================================
    if (
      role ===
        "HEADQUARTERS_MANAGER" ||
      role === "ADMIN"
    ) {

      const [
        branches,
        orders,
        reservations,
        users,
        inventory,
        reorderRequests
      ] = await Promise.all([

        prisma.branch.findMany({
          include: {
            orders: true,
            users: true,
            reservations: true
          }
        }),

        prisma.order.findMany({
          include: {
            branch: true
          },

          orderBy: {
            createdAt: "desc"
          }
        }),

        prisma.reservation.findMany({
          include: {
            branch: true
          },

          orderBy: {
            createdAt: "desc"
          }
        }),

        prisma.user.findMany(),

        prisma.inventory.findMany({
          include: {
            branch: true
          }
        }),

        prisma.reorderRequest.findMany({
          include: {
            branch: true,
            inventory: true
          },

          orderBy: {
            createdAt: "desc"
          }
        })
      ]);

      const totalRevenue =
        orders.reduce(
          (sum, order) =>
            sum + order.total,
          0
        );

      const branchComparison =
        branches.map(branch => {

          const branchOrders =
            orders.filter(
              order =>
                order.branchId ===
                branch.id
            );

          const revenue =
            branchOrders.reduce(
              (
                sum,
                order
              ) =>
                sum +
                order.total,
              0
            );

          return {
            branch:
              branch.name,

            revenue,

            orders:
              branchOrders.length
          };
        });

      const recentActivity = [

        ...orders.slice(0, 5).map(
          order => ({
            type:
              "ORDER",

            message:
              `Order completed in ${order.branch?.name}`,

            createdAt:
              order.createdAt
          })
        ),

        ...reservations
          .slice(0, 5)
          .map(
            reservation => ({
              type:
                "RESERVATION",

              message:
                `Reservation created in ${reservation.branch?.name}`,

              createdAt:
                reservation.createdAt
            })
          ),

        ...reorderRequests
          .slice(0, 5)
          .map(
            request => ({
              type:
                "REORDER",

              message:
                `Reorder request for ${request.inventory?.name}`,

              createdAt:
                request.createdAt
            })
          )
      ]
        .sort(
          (
            a,
            b
          ) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        )
        .slice(0, 10);

      const lowStockItems =
        inventory.filter(
          item =>
            item.quantity <=
            item.minimumLevel
        );

      return res.status(200).json({

        dashboardType:
          "HQ",

        summary: {

          totalRevenue,

          totalBranches:
            branches.length,

          activeStaff:
            users.length,

          totalOrders:
            orders.length,

          lowStockItems:
            lowStockItems.length
        },

        charts: {

          branchComparison,

          recentActivity
        }
      });
    }

    // ==========================================
    // INVENTORY MANAGER
    // ==========================================
    if (
      role ===
      "INVENTORY_MANAGER"
    ) {

      const inventory =
        await prisma.inventory.findMany({
          include: {
            supplier: true,
            branch: true
          }
        });

      return res.status(200).json({

        dashboardType:
          "INVENTORY_MANAGER",

        inventory
      });
    }

    // ==========================================
    // KITCHEN STAFF
    // ==========================================
    if (
      role ===
      "KITCHEN_STAFF"
    ) {

      const activeOrders =
        await prisma.order.findMany({
          where: {
            branchId:
              userBranchId!,

            status: {
              in: [
                "PAID",
                "PREPARING"
              ]
            }
          },

          include: {
            items: {
              include: {
                menuItem: true
              }
            }
          },

          orderBy: {
            createdAt: "asc"
          }
        });

      return res.status(200).json({

        dashboardType:
          "KITCHEN_STAFF",

        activeOrders
      });
    }

    // ==========================================
    // WAITER
    // ==========================================
    if (
      role === "WAITER"
    ) {

      const [
        readyOrders,
        reservations
      ] = await Promise.all([

        prisma.order.findMany({
          where: {
            branchId:
              userBranchId!,

            status: {
              in: [
                "READY",
                "SERVED"
              ]
            }
          },

          include: {
            customer: true,

            items: {
              include: {
                menuItem: true
              }
            }
          }
        }),

        prisma.reservation.findMany({
          where: {
            branchId:
              userBranchId!,

            status: {
              in: [
                "PENDING",
                "CONFIRMED",
                "SEATED"
              ]
            }
          },

          orderBy: {
            reservationTime: "asc"
          }
        })
      ]);

      return res.status(200).json({

        dashboardType:
          "WAITER",

        readyOrders,

        reservations
      });
    }

    // ==========================================
    // FALLBACK
    // ==========================================
    return res.status(403).json({
      message:
        "Unauthorized dashboard access"
    });

  } catch (error) {

    console.error(
      "DASHBOARD ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load dashboard"
    });
  }
};
