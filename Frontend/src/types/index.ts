export type UserRole =
  | 'BRANCH_MANAGER'
  | 'HEADQUARTERS_MANAGER'
  | 'ADMIN'
  | 'KITCHEN_STAFF'
  | 'INVENTORY_MANAGER'
  | 'WAITER'
  | 'CUSTOMER';

export interface User {
  id: string;

  fullName: string;

  email: string;

  role: UserRole;

  branchId?: number | null;

  branch?: Branch;
}

export interface Branch {
  id: number;

  name: string;

  city: string;

  address: string;

  phone: string;

  openingHours: string;

  image?: string | null;

  description?: string | null;
}

export interface AuthResponse {
  token: string;

  user: User;
}

export interface ApiResponse<T> {
  success: boolean;

  data: T;

  message?: string;

  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;

  data: {
    items: T[];

    total: number;

    page: number;

    limit: number;

    pages: number;
  };
}