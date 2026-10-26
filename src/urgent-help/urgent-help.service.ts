import { HttpStatus, Injectable } from '@nestjs/common';
import { UrgentHelpStatus, UrgentHelpTriggerSource } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { CreateManualUrgentHelpDto } from './dto/create-manual-urgent-help.dto';
import { UpdateUrgentHelpStatusDto } from './dto/update-urgent-help-status.dto';

@Injectable()
export class UrgentHelpService {
  constructor(private readonly prisma: PrismaService) {}

  /** طلب مساعدة عاجلة يدوي — بلا ربط بأي تقييم بالضرورة، متاح لأي أم/زوج في أي وقت */
  createManual(userId: string, dto: CreateManualUrgentHelpDto) {
    return this.prisma.urgentHelpRequest.create({
      data: {
        userId,
        triggerSource: UrgentHelpTriggerSource.manual_button,
        status: UrgentHelpStatus.open,
        notes: dto.notes,
      },
    });
  }

  /** مرتبة: open أولاً (الأحدث فالأقدم)، ثم البقية (الأحدث فالأقدم) — لطاقم الأدمن/الأخصائيين */
  // عدد المفتوحة فقط، بلا أي بيانات شخصية — لشارة/تنبيه الإدارة الذي يُستطلَع كل 30 ثانية من كل صفحات
  // /admin؛ منفصل عن listAll عمدًا كي لا يُملأ سجل النشاط بإدخال view_urgent_help_requests كل 30 ثانية
  async countOpen() {
    const open = await this.prisma.urgentHelpRequest.count({ where: { status: UrgentHelpStatus.open } });
    return { open };
  }

  // assessmentResult (الدرجة والتصنيف) مستبعد عمدًا — الهدف هنا الاتصال بالأم لا عرض نتيجة تقييمها النفسي
  async listAll() {
    const [open, rest] = await Promise.all([
      this.prisma.urgentHelpRequest.findMany({
        where: { status: UrgentHelpStatus.open },
        include: { user: { select: { id: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.urgentHelpRequest.findMany({
        where: { status: { not: UrgentHelpStatus.open } },
        include: { user: { select: { id: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return [...open, ...rest];
  }

  async updateStatus(id: string, dto: UpdateUrgentHelpStatusDto) {
    const existing = await this.prisma.urgentHelpRequest.findUnique({ where: { id } });
    if (!existing) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'الطلب غير موجود',
        en: 'Request not found',
      });
    }
    return this.prisma.urgentHelpRequest.update({
      where: { id },
      data: { status: dto.status, notes: dto.notes ?? existing.notes },
    });
  }
}
