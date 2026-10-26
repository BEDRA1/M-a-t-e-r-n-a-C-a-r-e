import { Injectable } from '@nestjs/common';
import { NotificationType, PregnancyStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { BroadcastAudience, SendBroadcastDto } from './dto/broadcast.dto';

// المعطّلون والإدارة خارج كل الفئات. "النفاس" = لها فترة نفاس ولا حمل نشط جديد —
// نفس ما تراه الأم في لوحتها (قسم النفاس يظهر لأي فترة نفاس مسجّلة)
const AUDIENCE_WHERE: Record<BroadcastAudience, Prisma.UserWhereInput> = {
  all: { isActive: true, role: { in: [UserRole.mother, UserRole.spouse, UserRole.specialist] } },
  pregnant: { isActive: true, role: UserRole.mother, pregnancies: { some: { status: PregnancyStatus.active } } },
  postpartum: {
    isActive: true,
    role: UserRole.mother,
    postpartumPeriods: { some: {} },
    pregnancies: { none: { status: PregnancyStatus.active } },
  },
  specialists: { isActive: true, role: UserRole.specialist },
};

@Injectable()
export class BroadcastService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async countRecipients(audience: BroadcastAudience) {
    const recipients = await this.prisma.user.count({ where: AUDIENCE_WHERE[audience] });
    return { audience, recipients };
  }

  async send(adminUserId: string, dto: SendBroadcastDto) {
    const users = await this.prisma.user.findMany({ where: AUDIENCE_WHERE[dto.audience], select: { id: true } });
    const { count } = await this.prisma.notification.createMany({
      data: users.map((u) => ({ userId: u.id, type: NotificationType.broadcast, title: dto.title, body: dto.body })),
    });
    await this.auditLog.record({
      adminUserId,
      action: 'send_broadcast',
      entityType: 'notification',
      details: { audience: dto.audience, title: dto.title, body: dto.body, recipients: count },
    });
    return { audience: dto.audience, recipients: count };
  }
}
