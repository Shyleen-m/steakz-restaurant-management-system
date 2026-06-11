import { Response } from "express";
import { prisma } from "../config/prisma.js";

export const getStaff = async (
  req: any,
  res: Response
) => {
  try {
    const role = req.user?.role;

    const branchId =
      req.user?.branchId;

    let where: any = {};

    // BRANCH MANAGER
    if (
      role === "BRANCH_MANAGER"
    ) {
      where.branchId = branchId;
    }

    // HQ cannot see admins
    if (
      role ===
      "HEADQUARTERS_MANAGER"
    ) {
      where.role = {
        not: "ADMIN"
      };
    }

    const users =
      await prisma.user.findMany({
        where,

        include: {
          branch: true
        },

        orderBy: {
          createdAt: "desc"
        }
      });

    res.status(200).json({
      users
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load staff"
    });
  }
};

export const toggleStaffStatus =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const currentRole =
        req.user?.role;

      const currentBranch =
        req.user?.branchId;

      const user =
        await prisma.user.findUnique({
          where: {
            id: req.params.id
          }
        });

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              "User not found"
          });
      }

      // HQ cannot manage admins
      if (
        currentRole ===
          "HEADQUARTERS_MANAGER" &&
        user.role === "ADMIN"
      ) {
        return res
          .status(403)
          .json({
            message:
              "Cannot manage admins"
          });
      }

      // BRANCH MANAGER ONLY OWN BRANCH
      if (
        currentRole ===
          "BRANCH_MANAGER" &&
        user.branchId !==
          currentBranch
      ) {
        return res
          .status(403)
          .json({
            message:
              "Access denied"
          });
      }

      const updatedUser =
        await prisma.user.update({
          where: {
            id: req.params.id
          },

          data: {
            isActive:
              !user.isActive
          }
        });

      res.status(200).json({
        user: updatedUser
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to update user"
      });
    }
  };

export const deleteStaff =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const currentRole =
        req.user?.role;

      // ONLY ADMIN CAN DELETE
      if (
        currentRole !== "ADMIN"
      ) {
        return res
          .status(403)
          .json({
            message:
              "Only admins can delete users"
          });
      }

      const user =
        await prisma.user.findUnique({
          where: {
            id: req.params.id
          }
        });

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              "User not found"
          });
      }

      await prisma.user.delete({
        where: {
          id: req.params.id
        }
      });

      res.status(200).json({
        message:
          "User deleted successfully"
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to delete user"
      });
    }
  };