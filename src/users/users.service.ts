import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // select صريح لا include — passwordHash وrefreshTokens والبريد وتاريخ الميلاد لا تخرج أبدًا من هنا
  listAll(role?: UserRole) {
    return this.prisma.user.findMany({
      where: role ? { role } : {},
      select: {
        id: true,
        phone: true,
        role: true,
        wilaya: true,
        createdAt: true,
        _count: { select: { bookingsMade: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
