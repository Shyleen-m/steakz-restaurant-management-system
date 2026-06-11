import { Response } from "express";
import { ReservationStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { io } from "../index.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
  canAccessBranch,
  isGlobalRole
} from "../middleware/permissions.middleware.js";

import {
  catchAsync,
  AppError
} from "../middleware/error.middleware.js";

import { sendSuccess } from "../utils/response.js";

/**
 * CREATE RESERVATION
 */
export const createReservation = catchAsync(
  async (
    req: AuthRequest,
    res: Response
  ) => {

    const {
      customerName,
      customerEmail,
      customerPhone,
      reservationTime,
      guests,
      specialRequests
    } = req.body;

    const branchMap: Record<string, number> = {
      manchester: 1,
      birmingham: 2,
      cardiff: 3,
      edinburgh: 4,
      leeds: 5,
      london: 6
    };

    const branchId =
      branchMap[
        req.body.branch?.toLowerCase()
      ];

    if (!branchId) {

      throw new AppError(
        "Invalid branch selected",
        400
      );
    }

    const reservation =
      await prisma.reservation.create({

        data: {

          customerName,

          customerEmail:
            req.user?.email ||
            customerEmail,

          customerPhone,

          reservationTime:
            new Date(
              reservationTime
            ),

          guests:
            Number(guests),

          specialRequests,

          branchId,

          status:
            "PENDING"
        },

        include: {
          branch: true
        }
      });

    io.to(
      `branch_${reservation.branchId}`
    )
      .to("global_analytics")
      .emit(
        "reservation:created",
        reservation
      );

    return sendSuccess(
      res,
      reservation,
      201,
      "Reservation created successfully"
    );
  }
);

/**
 * GET RESERVATIONS
 */
export const getReservations = catchAsync(
  async (
    req: AuthRequest,
    res: Response
  ) => {

    const {
      status,
      date,
      branchId
    } = req.query;

    const where: any = {};

    /**
     * CUSTOMER
     */
    if (
      req.user?.role ===
      "CUSTOMER"
    ) {

      where.customerEmail =
        req.user.email;
    }

    /**
     * STAFF BRANCH ISOLATION
     */
    else if (
      !isGlobalRole(
        req.user?.role
      )
    ) {

      if (
        !req.user?.branchId
      ) {

        throw new AppError(
          "No branch assigned",
          403
        );
      }

      where.branchId =
        req.user.branchId;
    }

    /**
     * HQ / ADMIN
     */
    else if (branchId) {

      where.branchId =
        Number(branchId);
    }

    /**
     * STATUS FILTER
     */
    if (status) {

      where.status = status;
    }

    /**
     * DATE FILTER
     */
    if (date === "today") {

      const startOfDay =
        new Date();

      startOfDay.setHours(
        0,
        0,
        0,
        0
      );

      const endOfDay =
        new Date();

      endOfDay.setHours(
        23,
        59,
        59,
        999
      );

      where.reservationTime = {
        gte: startOfDay,
        lte: endOfDay
      };

    } else if (date) {

      const selectedDate =
        new Date(
          date as string
        );

      const startOfDay =
        new Date(
          selectedDate
        );

      startOfDay.setHours(
        0,
        0,
        0,
        0
      );

      const endOfDay =
        new Date(
          selectedDate
        );

      endOfDay.setHours(
        23,
        59,
        59,
        999
      );

      where.reservationTime = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    const reservations =
      await prisma.reservation.findMany({

        where,

        include: {
          branch: true
        },

        orderBy: {
          reservationTime:
            "asc"
        }
      });

    return sendSuccess(
      res,
      {
        total:
          reservations.length,

        reservations
      }
    );
  }
);

/**
 * GET SINGLE RESERVATION
 */
export const getSingleReservation =
  catchAsync(
    async (
      req: AuthRequest,
      res: Response
    ) => {

      const reservation =
        await prisma.reservation.findUnique({

          where: {
            id:
              Number(
                req.params.id
              )
          },

          include: {
            branch: true
          }
        });

      if (!reservation) {

        throw new AppError(
          "Reservation not found",
          404
        );
      }

      /**
       * CUSTOMER ACCESS
       */
      if (
        req.user?.role ===
          "CUSTOMER" &&
        reservation.customerEmail !==
          req.user.email
      ) {

        throw new AppError(
          "Access denied",
          403
        );
      }

      /**
       * STAFF ACCESS
       */
      if (
        req.user?.role !==
          "CUSTOMER" &&
        !canAccessBranch(
          req.user,
          reservation.branchId
        )
      ) {

        throw new AppError(
          "Access denied: Reservation belongs to another branch",
          403
        );
      }

      return sendSuccess(
        res,
        reservation
      );
    }
  );

/**
 * UPDATE RESERVATION STATUS
 */
export const updateReservationStatus =
  catchAsync(
    async (
      req: AuthRequest,
      res: Response
    ) => {

      const {
        status,
        tableNumber
      } = req.body;

      const allowedStatuses:
        ReservationStatus[] = [

        "PENDING",
        "CONFIRMED",
        "SEATED",
        "COMPLETED",
        "CANCELLED",
        "NO_SHOW"
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {

        throw new AppError(
          "Invalid reservation status",
          400
        );
      }

      const reservation =
        await prisma.reservation.findUnique({

          where: {
            id:
              Number(
                req.params.id
              )
          }
        });

      if (!reservation) {

        throw new AppError(
          "Reservation not found",
          404
        );
      }

      /**
       * BRANCH ISOLATION
       */
      if (
        !canAccessBranch(
          req.user,
          reservation.branchId
        )
      ) {

        throw new AppError(
          "Access denied: Cannot update reservations for other branches",
          403
        );
      }

      const updatedReservation =
        await prisma.reservation.update({

          where: {
            id:
              Number(
                req.params.id
              )
          },

          data: {

            status,

            tableNumber:
              tableNumber ??
              reservation.tableNumber
          },

          include: {
            branch: true
          }
        });

      /**
       * REALTIME UPDATE
       */
      io.to(
        `branch_${updatedReservation.branchId}`
      )
        .to(
          "global_analytics"
        )
        .emit(
          "reservation:updated",
          updatedReservation
        );

      /**
       * CUSTOMER UPDATE
       */
      if (
        updatedReservation.customerEmail
      ) {

        io.to(
          `customer_${updatedReservation.customerEmail}`
        ).emit(
          "reservation:updated",
          updatedReservation
        );
      }

      return sendSuccess(
        res,
        updatedReservation,
        200,
        "Reservation status updated successfully"
      );
    }
  );

/**
 * DELETE RESERVATION
 */
export const deleteReservation =
  catchAsync(
    async (
      req: AuthRequest,
      res: Response
    ) => {

      const reservation =
        await prisma.reservation.findUnique({

          where: {
            id:
              Number(
                req.params.id
              )
          }
        });

      if (!reservation) {

        throw new AppError(
          "Reservation not found",
          404
        );
      }

      /**
       * BRANCH ISOLATION
       */
      if (
        !canAccessBranch(
          req.user,
          reservation.branchId
        )
      ) {

        throw new AppError(
          "Access denied: Cannot delete reservations from other branches",
          403
        );
      }

      await prisma.reservation.delete({

        where: {
          id:
            Number(
              req.params.id
            )
        }
      });

      /**
       * REALTIME DELETE
       */
      io.to(
        `branch_${reservation.branchId}`
      )
        .to(
          "global_analytics"
        )
        .emit(
          "reservation:deleted",
          req.params.id
        );

      return sendSuccess(
        res,
        null,
        200,
        "Reservation deleted successfully"
      );
    }
  );
