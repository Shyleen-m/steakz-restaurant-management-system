import { Response } from "express";

import { prisma } from "../config/prisma.js";

export const getAdminOverview = async (
  _req: any,
  res: Response
) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalBranches,
      activeOrders,
      reservations,
      lowStock
    ] = await Promise.all([
      prisma.user.count(),

      prisma.user.count({
        where: {
          isActive: true
        }
      }),

      prisma.branch.count(),

      prisma.order.count({
        where: {
          status: {
            in: [
              "PENDING_PAYMENT",
              "PAID",
              "PREPARING"
            ]
          }
        }
      }),

      prisma.reservation.count(),

      prisma.inventory.count({
        where: {
          quantity: {
            lte: 10
          }
        }
      })
    ]);

    return res.status(200).json({
      success: true,

      system: {
        database: "HEALTHY",
        sockets: "CONNECTED",
        api: "OPERATIONAL",
        security: "SECURE"
      },

      metrics: {
        totalUsers,
        activeUsers,
        totalBranches,
        activeOrders,
        reservations,
        lowStock
      },

      charts: {
        systemLoad: [
          {
            time: "08:00",
            requests: 22
          },

          {
            time: "10:00",
            requests: 48
          },

          {
            time: "12:00",
            requests: 61
          },

          {
            time: "14:00",
            requests: 75
          },

          {
            time: "16:00",
            requests: 52
          },

          {
            time: "18:00",
            requests: 38
          }
        ],

        branchActivity: [
          {
            branch: "Manchester",
            users: 12
          },

          {
            branch: "London",
            users: 18
          },

          {
            branch: "Cardiff",
            users: 9
          },

          {
            branch: "Leeds",
            users: 7
          },

          {
            branch: "Birmingham",
            users: 11
          },

          {
            branch: "Edinburgh",
            users: 8
          }
        ]
      },

      activity: [
        {
          time: "2 mins ago",
          message:
            "New branch manager login detected"
        },

        {
          time: "5 mins ago",
          message:
            "Inventory updated in Manchester"
        },

        {
          time: "11 mins ago",
          message:
            "Reservation confirmed in Cardiff"
        },

        {
          time: "18 mins ago",
          message:
            "Kitchen queue synchronized"
        },

        {
          time: "25 mins ago",
          message:
            "System analytics refreshed"
        }
      ],

      branches: [
        {
          name: "Manchester",
          status: "ONLINE"
        },

        {
          name: "London",
          status: "ONLINE"
        },

        {
          name: "Cardiff",
          status: "ONLINE"
        },

        {
          name: "Birmingham",
          status: "ONLINE"
        },

        {
          name: "Edinburgh",
          status: "ONLINE"
        },

        {
          name: "Leeds",
          status: "ONLINE"
        }
      ]
    });

  } catch (error) {
    console.error(
      "ADMIN OVERVIEW ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load admin overview"
    });
  }
};
