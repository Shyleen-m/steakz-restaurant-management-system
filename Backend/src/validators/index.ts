import { z } from "zod";

/**
 * AUTH
 */

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),

    email: z.string().email(),

    password: z.string().min(6),

    role: z.string().optional(),

    branchId: z.number().optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),

    password: z.string().min(6)
  })
});

/**
 * ORDERS
 */

export const createOrderSchema = z.object({
  body: z.object({
    tableNumber: z.union([
  z.string(),
  z.number()
]),

    branchId: z.number().optional(),

    orderType: z.enum(["DINE_IN", "TAKEAWAY"]).optional(),

    guestCount: z.number().min(1).optional(),

    items: z.array(
      z.object({
        menuItemId: z.string(),

        quantity: z.number().min(1)
      })
    )
  })
});

/**
 * INVENTORY
 */

export const adjustStockSchema = z.object({
  body: z.object({
    quantityChange: z.number(),

    action: z.enum([
      "RESTOCK",
      "WASTAGE",
      "ADJUSTMENT",
      "USAGE"
    ]),

    note: z.string().optional()
  })
});

/**
 * RESERVATIONS
 */

export const createReservationSchema = z.object({
  body: z.object({
    customerName: z.string().min(2),

    customerEmail: z.string().email().optional(),

    customerPhone: z.string().min(5),

    reservationTime: z.string(),

    guests: z.number().min(1),

    specialRequests: z.string().optional(),

    branch: z.string()
  })
});