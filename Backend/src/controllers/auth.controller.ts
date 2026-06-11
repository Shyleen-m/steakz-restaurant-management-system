import { Request, Response } from "express";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { prisma } from "../config/prisma.js";
import { catchAsync, AppError } from "../middleware/error.middleware.js";
import { sendSuccess } from "../utils/response.js";

interface JwtPayload {
  id: string;
  role: Role;
  branchId?: number | null;
}

const generateToken = (user: JwtPayload) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      branchId: user.branchId
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d"
    }
  );
};

/**
 * REGISTER USER / CUSTOMER
 */
export const register = catchAsync(async (req: Request, res: Response) => {
  const {
    fullName,
    email,
    password,
    role,
    branchId
  } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  /**
   * DEFAULT ROLE
   * PUBLIC USERS BECOME CUSTOMERS
   */
  let userRole: Role = Role.CUSTOMER;

  /**
   * ONLY ALLOW STAFF ROLE CREATION
   * IF ROLE PROVIDED
   */
  const allowedRoles = [
  "CUSTOMER",
  "WAITER",
  "KITCHEN_STAFF",
  "BRANCH_MANAGER"
];

if (
  role &&
  allowedRoles.includes(role)
) {
  userRole = role as Role;
}

  /**
   * CUSTOMERS SHOULD NOT HAVE BRANCHES
   */
  const finalBranchId =
    userRole === Role.CUSTOMER
      ? null
      : branchId || null;

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
  data: {
    fullName,
    email,
    password: hashedPassword,

    role: userRole || "CUSTOMER",

    branchId:
      userRole === "CUSTOMER"
        ? null
        : finalBranchId,

    isActive: true
  }
});
  const token = generateToken({
    id: user.id,
    role: user.role,
    branchId: user.branchId
  });

  return sendSuccess(
    res,
    {
      token,

      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        branchId: user.branchId
      }
    },
    201,
    "User registered successfully"
  );
});

/**
 * LOGIN USER
 */
export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      branch: true
    }
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("Account disabled", 403);
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken({
    id: user.id,
    role: user.role,
    branchId: user.branchId
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return sendSuccess(
    res,
    {
      token,

      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        branch: user.branch
      }
    },
    200,
    "Login successful"
  );
});

/**
 * CURRENT USER
 */
export const getCurrentUser = catchAsync(
  async (req: any, res: Response) => {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id
      },
      include: {
        branch: true
      }
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return sendSuccess(res, { user });
  }
);

/**
 * LOGOUT
 */
export const logout = catchAsync(
  async (_req: Request, res: Response) => {
    res.clearCookie("token");

    return sendSuccess(
      res,
      null,
      200,
      "Logged out successfully"
    );
  }
);

