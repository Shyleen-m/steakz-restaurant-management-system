import { Response } from "express";

import {
  PaymentMethod,
  PaymentStatus
} from "@prisma/client";

import { prisma } from "../config/prisma.js";

import { AuthRequest } from "../middleware/auth.middleware.js";

import { io } from "../index.js";

/**
 * CREATE PAYMENT
 */
export const createPayment = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    console.log(req.user);

    
    const {
      orderId,
      paymentMethod
    } = req.body;

    if (
      !orderId ||
      !paymentMethod
    ) {
      return res.status(400).json({
        message:
          "Order ID and payment method are required"
      });
    }

    /**
     * FIND ORDER
     */
    const order =
      await prisma.order.findUnique({
        where: {
          id: orderId
        },

        include: {
          customer: true,
          branch: true,
          payment: true
        }
      });

    if (!order) {
      return res.status(404).json({
        message:
          "Order not found"
      });
    }

    /**
     * CUSTOMER SECURITY
     */
    if (
  req.user?.role ===
    "CUSTOMER" &&
  order.customerId !==
    req.user?.id
) {
  return res.status(403).json({
    message:
      "Access denied"
  });
}

    /**
     * ALREADY PAID
     */
    if (order.payment) {
      return res.status(400).json({
        message:
          "Order already has payment"
      });
    }

    /**
     * CREATE PAYMENT
     * (FAKE STRIPE SIMULATION)
     */
    const payment =
      await prisma.payment.create({
        data: {
          amount: order.total,

          paymentMethod:
            paymentMethod as PaymentMethod,

          status:
            PaymentStatus.PAID,

          order: {
            connect: {
              id: order.id
            }
          },

          branch: {
            connect: {
              id: order.branchId
            }
          }
        }
      });

    /**
     * UPDATE ORDER STATUS
     */
    const updatedOrder =
      await prisma.order.update({
        where: {
          id: order.id
        },

        data: {
          status: "PAID"
        },

        include: {
          customer: true,

          branch: true,

          payment: true,

          items: {
            include: {
              menuItem: true
            }
          }
        }
      });

    /**
     * GENERATE RECEIPT
     */
    const subtotal = updatedOrder.total;
    const taxAmount = subtotal * 0.1;
    const serviceCharge = subtotal * 0.05;
    const grandTotal = subtotal + taxAmount + serviceCharge;
    const receiptNo = `REC-${Date.now()}-${updatedOrder.tableNumber}`;

    await prisma.receipt.create({
      data: {
        receiptNo,
        subtotal,
        taxAmount,
        serviceCharge,
        total: grandTotal,
        paymentMethod: updatedOrder.payment?.paymentMethod || paymentMethod,
        order: {
          connect: { id: updatedOrder.id }
        },
        branch: {
          connect: { id: updatedOrder.branchId }
        }
      }
    });

    /**
     * REALTIME EVENTS
     */
    console.log(`[Socket] Emitting payment:completed to branch_${updatedOrder.branchId}`);
    io.to(
      `branch_${updatedOrder.branchId}`
    )
      .to("global_analytics")
      .emit(
        "payment:completed",
        updatedOrder
      );

    /**
     * CUSTOMER TRACKING
     */
    io.to(
      `customer_${updatedOrder.customerId}`
    ).emit(
      "customer:payment_success",
      updatedOrder
    );

    return res.status(201).json({
      message:
        "Payment successful",

      payment,

      order:
        updatedOrder
    });

  } catch (error) {
    console.error(
      "PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Payment failed"
    });
  }
};

