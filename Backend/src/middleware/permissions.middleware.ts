import { Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { AuthRequest } from "./auth.middleware";

/**
 * ✅ UNIFIED ROLE AUTHORIZATION
 * Checks if the user has one of the allowed roles.
 */
export const allowRoles = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "Access denied: Insufficient permissions" });
      return;
    }

    next();
  };
};

/**
 * ✅ GLOBAL SCOPE CHECK
 * Helper to determine if a role is global
 * Based on constraint: Only chefs and waiters are branch-specific.
 */
export const isGlobalRole = (role?: Role): boolean => {
  return (
    role === "HEADQUARTERS_MANAGER" ||
    role === "ADMIN" ||
    role === "INVENTORY_MANAGER"
  );
};

/**
 * ✅ BRANCH ISOLATION MIDDLEWARE
 * Standardizes branch access across the system.
 * Prevents branch-restricted roles from accessing data from other branches.
 */
export const enforceBranchIsolation = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // HQ & Admin bypass isolation
  if (isGlobalRole(req.user.role)) {
    next();
    return;
  }

  // Get branchId from any possible location
  const requestedBranchId =
    req.params.branchId ||
    req.body.branchId ||
    req.query.branchId;

  if (!requestedBranchId) {
    // If no branchId requested, we default to the user's branch
    // This is useful for list views where branchId might not be in params
    next();
    return;
  }

  if (req.user.branchId !== Number(requestedBranchId)) {
    res.status(403).json({
      message: "Cross-branch access denied"
    });
    return;
  }

  next();
};

/**
 * ✅ ROLE SPECIFIC SHORTHANDS (Cleaned Up)
 */
export const hqOnly = allowRoles("HEADQUARTERS_MANAGER");
export const adminOnly = allowRoles("ADMIN");
export const hqOrAdminOnly = allowRoles("HEADQUARTERS_MANAGER", "ADMIN");
export const branchManagerOnly = allowRoles("BRANCH_MANAGER");
export const kitchenStaffOnly = allowRoles("KITCHEN_STAFF");
export const inventoryManagerOnly = allowRoles("INVENTORY_MANAGER");

/**
 * ✅ CONTROLLER UTILITY: Check Branch Access
 * Used inside controllers when fetching a specific resource (e.g., an Order)
 * to verify it belongs to the user's branch.
 */
export const canAccessBranch = (user: any, resourceBranchId: number): boolean => {
  if (isGlobalRole(user.role)) return true;
  return user.branchId === resourceBranchId;
};