import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  userId: string;
  phone: string;
  role: UserRole;
}
