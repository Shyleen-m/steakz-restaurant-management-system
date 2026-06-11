import { Role } from "@prisma/client";

export const permissions = {
  // =========================
  // DASHBOARDS
  // =========================

  canViewHQDashboard: [
    "HEADQUARTERS_MANAGER"
  ] as Role[],

  canViewBranchDashboard: [
    "BRANCH_MANAGER"
  ] as Role[],

  canViewKitchenDashboard: [
    "KITCHEN_STAFF"
  ] as Role[],

  canViewInventoryDashboard: [
    "INVENTORY_MANAGER"
  ] as Role[],

  canViewSystemDashboard: [
    "ADMIN"
  ] as Role[],

  // =========================
  // RESERVATIONS
  // =========================

  canViewReservations: [
    "HEADQUARTERS_MANAGER",
    "BRANCH_MANAGER",
    "KITCHEN_STAFF",
    "ADMIN"
  ] as Role[],

  // =========================
  // ORDERS
  // =========================

  canViewOrders: [
    "BRANCH_MANAGER",
    "KITCHEN_STAFF"
  ] as Role[],

  canUpdateOrderStatus: [
    "KITCHEN_STAFF"
  ] as Role[],

  // =========================
  // INVENTORY
  // =========================

  canViewInventory: [
    "INVENTORY_MANAGER",
    "BRANCH_MANAGER",
    "KITCHEN_STAFF"
  ] as Role[],

  canManageInventory: [
    "INVENTORY_MANAGER"
  ] as Role[],

  canSendInventoryAlerts: [
    "KITCHEN_STAFF"
  ] as Role[],

  // =========================
  // SYSTEM ACCESS
  // =========================

  canAccessSystemTools: [
    "ADMIN"
  ] as Role[]
};