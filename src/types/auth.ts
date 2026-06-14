import { UserRole } from "@prisma/client";

export interface SessionUser {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface SessionPayload {
  user: SessionUser;
  expiresAt: number;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TenantContext {
  companyId: string;
  userId: string;
  role: UserRole;
}
