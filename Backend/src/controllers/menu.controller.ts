import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

/**
 * GET ALL MENU ITEMS
 */
export const getMenuItems = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const menuItems =
      await prisma.menuItem.findMany({
        include: {
          branch: true
        },

        orderBy: {
          createdAt: "desc"
        }
      });

    return res.status(200).json({
      menuItems
    });
  } catch (error) {
    console.error(
      "GET MENU ITEMS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch menu items"
    });
  }
};

/**
 * CREATE MENU ITEM
 */
export const createMenuItem = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      name,
      description,
      category,
      price,
      image,
      available,
      branchId
    } = req.body;

    const menuItem =
      await prisma.menuItem.create({
        data: {
          name,
          description,
          category,
          price: Number(price),
          image,
          available,
          branchId
        }
      });

    return res.status(201).json({
      message:
        "Menu item created successfully",

      menuItem
    });
  } catch (error) {
    console.error(
      "CREATE MENU ITEM ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create menu item"
    });
  }
};

/**
 * UPDATE MENU ITEM
 */
export const updateMenuItem = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const updatedMenuItem =
      await prisma.menuItem.update({
        where: {
          id
        },

        data: req.body
      });

    return res.status(200).json({
      message:
        "Menu item updated successfully",

      menuItem: updatedMenuItem
    });
  } catch (error) {
    console.error(
      "UPDATE MENU ITEM ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update menu item"
    });
  }
};

/**
 * DELETE MENU ITEM
 */
export const deleteMenuItem = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    await prisma.menuItem.delete({
      where: {
        id
      }
    });

    return res.status(200).json({
      message:
        "Menu item deleted successfully"
    });
  } catch (error) {
    console.error(
      "DELETE MENU ITEM ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to delete menu item"
    });
  }
};
