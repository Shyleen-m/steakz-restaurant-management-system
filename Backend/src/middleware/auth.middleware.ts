import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { prisma } from "../config/prisma.js";

export type AuthRequest = Request & {
  user?: any;
};

/**
 * 🔐 PROTECT MIDDLEWARE
 */
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    /**
     * TOKEN FROM HEADER
     */
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith(
        "Bearer "
      )
    ) {
      token =
        req.headers.authorization.split(
          " "
        )[1];
    }

    /**
     * TOKEN FROM COOKIE
     */
    if (
  !token &&
  (req as any).cookies?.token
) {
  token = (req as any).cookies.token;
}

    /**
     * NO TOKEN
     */
    if (!token) {
      return res.status(401).json({
        message:
          "Unauthorized - No token"
      });
    }

    /**
     * VERIFY TOKEN
     */
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as any;

    /**
     * FIND USER
     */
    const user =
      await prisma.user.findUnique({
        where: {
          id: decoded.id
        },

        include: {
          branch: true
        }
      });

    if (!user) {
      return res.status(401).json({
        message:
          "User no longer exists"
      });
    }

    /**
     * ATTACH USER
     */
    req.user = user;

    next();

  } catch (error) {
    console.error(
      "AUTH ERROR:",
      error
    );

    return res.status(401).json({
      message:
        "Unauthorized"
    });
  }
};

/**
 * OPTIONAL AUTH
 */
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith(
        "Bearer "
      )
    ) {
      token =
        req.headers.authorization.split(
          " "
        )[1];
    }

    if (
  !token &&
  (req as any).cookies?.token
) {
  token = (req as any).cookies.token;
}

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as any;

    const user =
      await prisma.user.findUnique({
        where: {
          id: decoded.id
        },

        include: {
          branch: true
        }
      });

    if (user) {
      req.user = user;
    }

    next();

  } catch {
    next();
  }
};
