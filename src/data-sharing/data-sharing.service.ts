import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { UpdateDataSharingDto } from './dto/update-data-sharing.dto';

const DEFAULT_SHARING = {
  shareMoodLogs: false,
  shareAssessments: false,
  sharePregnancyData: false,
  sharePostpartumData: false,
};

@Injectable()
export class DataSharingService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string, specialistId: string) {
    await this.getSpecialistOrThrow(specialistId);
    const existing = await this.prisma.patientDataSharing.findUnique({
      where: { userId_specialistId: { userId, specialistId } },
    });
    if (existing) return existing;
    // لا تُنشئ صفًا فعليًا عند القراءة فقط — تُرجَع القيم الافتراضية (لا مشاركة) حتى
    // تُجري الأم أول تحديث فعلي عبر PATCH
    return { userId, specialistId, ...DEFAULT_SHARING };
  }

  async update(userId: string, specialistId: string, dto: UpdateDataSharingDto) {
    await this.getSpecialistOrThrow(specialistId);
    return this.prisma.patientDataSharing.upsert({
      where: { userId_specialistId: { userId, specialistId } },
      update: { ...dto },
      create: { userId, specialistId, ...DEFAULT_SHARING, ...dto },
    });
  }

  private async getSpecialistOrThrow(specialistId: string) {
    const specialist = await this.prisma.specialist.findUnique({ where: { id: specialistId } });
    if (!specialist) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'الأخصائية غير موجودة',
        en: 'Specialist not found',
      });
    }
    return specialist;
  }
}
