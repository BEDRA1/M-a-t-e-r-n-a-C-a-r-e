import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';

function getDayOfYear(date: Date): number {
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const diffMs = date.getTime() - startOfYear.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

@Injectable()
export class DailyTipsService {
  constructor(private readonly prisma: PrismaService) {}

  async getToday() {
    const tips = await this.prisma.dailyTip.findMany({ orderBy: { tipNumber: 'asc' } });
    if (tips.length === 0) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'لا تتوفر نصائح حاليًا',
        en: 'No tips available yet',
      });
    }

    // التناوب حسب رقم اليوم في السنة يضمن ثبات نفس النصيحة طوال اليوم لكل المستخدمين
    const index = getDayOfYear(new Date()) % tips.length;
    return tips[index];
  }
}
