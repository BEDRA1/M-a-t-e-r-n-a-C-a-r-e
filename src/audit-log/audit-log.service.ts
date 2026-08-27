import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface RecordAuditLogInput {
  adminUserId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: unknown;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  // لا يجب أن يُسقط فشل تسجيل السجل الاستجابة الأصلية أبدًا — لذا يُبلَع الخطأ هنا فقط
  async record(input: RecordAuditLogInput): Promise<void> {
    try {
      await this.prisma.adminAuditLog.create({
        data: {
          adminUserId: input.adminUserId,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId ?? null,
          details: (input.details ?? undefined) as Prisma.InputJsonValue | undefined,
        },
      });
    } catch (err) {
      this.logger.error(`تعذّر تسجيل نشاط إداري: ${input.action}/${input.entityType}`, err as Error);
    }
  }

  findMany(filters: {
    adminUserId?: string;
    action?: string;
    entityType?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page: number;
    pageSize: number;
  }) {
    const where: Prisma.AdminAuditLogWhereInput = {
      adminUserId: filters.adminUserId,
      action: filters.action,
      entityType: filters.entityType,
      createdAt:
        filters.dateFrom || filters.dateTo
          ? { gte: filters.dateFrom, lte: filters.dateTo }
          : undefined,
    };

    return Promise.all([
      this.prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
        include: {
          adminUser: { select: { phone: true, role: true, adminProfile: { select: { fullName: true } } } },
        },
      }),
      this.prisma.adminAuditLog.count({ where }),
    ]);
  }
}
