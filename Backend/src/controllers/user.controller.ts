import { Request, Response } from "express";
import { Role } from "@prisma/client";

import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

/**
 * GET ALL USERS
 * HQ/Admin only
 */
export const getUsers = async (
  req: AuthRequest,
  res: Response
) => {
  try {
  const where: any = {};

  if (
      req.user?.role === "BRANCH_MANAGER"
    ) {
      return res.status(403).json({
        message:
          "Branch managers cannot access global users"
      });
    }

if (
  req.user?.role ===
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

    return res.status(200).json(users);
  } catch (error) {
    console.error("GET USERS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch users"
    });
  }
};

/**
 * UPDATE USER
 * Admin/HQ only
 */
export const updateUser = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const {
      fullName,
      email,
      role,
      branchId,
      isActive
    } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        email,
        role,
        branchId,
        isActive
      },
      include: {
        branch: true
      }
    });

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    return res.status(500).json({
      message: "Failed to update user"
    });
  }
};

/**
 * DEACTIVATE USER
 * Safer than deleting
 */
export const deactivateUser = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: false
      }
    });

    return res.status(200).json({
      message: "User deactivated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("DEACTIVATE USER ERROR:", error);

    return res.status(500).json({
      message: "Failed to deactivate user"
    });
  }
};

/**
 * ACTIVATE USER
 */
export const activateUser = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: true
      }
    });

    return res.status(200).json({
      message: "User activated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("ACTIVATE USER ERROR:", error);

    return res.status(500).json({
      message: "Failed to activate user"
    });
  }
};

/**
 * DELETE USER
 * Permanent removal
 */
export const deleteUser = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    await prisma.user.delete({
      where: { id }
    });

    return res.status(200).json({
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete user"
    });
  }
};