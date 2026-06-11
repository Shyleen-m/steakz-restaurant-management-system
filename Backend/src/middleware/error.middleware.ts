import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

/**
 * 🚨 CUSTOM ERROR CLASS
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 🛡️ GLOBAL ERROR HANDLER MIDDLEWARE
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Handle Prisma Known Errors (e.g., unique constraint)
  if (err.code === "P2002") {
    return res.status(409).json({
      status: "fail",
      message: `Duplicate field value: ${err.meta.target}`,
    });
  }

  // Production vs Development Response
  const response = {
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  res.status(err.statusCode).json(response);
};

/**
 * ⚡ ASYNC HANDLER WRAPPER
 * Removes the need for repetitive try/catch in controllers
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
