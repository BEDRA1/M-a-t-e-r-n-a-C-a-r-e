import { HttpStatus, Injectable } from '@nestjs/common';
import { ConsultationType, SpecialistStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { CreateAvailabilityDto } from './dto/create-availability.dto';

@Injectable()
export class SpecialistAvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(specialistUserId: string, dto: CreateAvailabilityDto) {
    const specialist = await this.getSpecialistOrThrow(specialistUserId);

    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    if (endTime <= startTime) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'وقت النهاية يجب أن يكون بعد وقت البداية',
        en: 'End time must be after start time',
      });
    }
    if (startTime < new Date()) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'لا يمكن إضافة فترة توفر في الماضي',
        en: 'Cannot add an availability slot in the past',
      });
    }

    try {
      return await this.prisma.specialistAvailability.create({
        data: {
          specialistId: specialist.id,
          startTime,
          endTime,
          consultationType: dto.consultationType,
          wilaya: dto.consultationType === ConsultationType.in_person ? dto.wilaya : null,
        },
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new AppException(HttpStatus.CONFLICT, {
          ar: 'لديك فترة توفر بنفس وقت البداية بالفعل',
          en: 'You already have an availability slot starting at this time',
        });
      }
      throw error;
    }
  }

  async listMine(specialistUserId: string) {
    const specialist = await this.getSpecialistOrThrow(specialistUserId);
    return this.prisma.specialistAvailability.findMany({
      where: { specialistId: specialist.id },
      orderBy: { startTime: 'asc' },
    });
  }

  async deleteMine(specialistUserId: string, slotId: string) {
    const specialist = await this.getSpecialistOrThrow(specialistUserId);
    const slot = await this.prisma.specialistAvailability.findUnique({ where: { id: slotId } });
    if (!slot || slot.specialistId !== specialist.id) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'فترة التوفر غير موجودة',
        en: 'Availability slot not found',
      });
    }
    if (slot.isBooked) {
      throw new AppException(HttpStatus.CONFLICT, {
        ar: 'لا يمكن حذف فترة محجوزة بالفعل',
        en: 'Cannot delete a slot that is already booked',
      });
    }
    await this.prisma.specialistAvailability.delete({ where: { id: slotId } });
    return { deleted: true };
  }

  async listAvailable(filters: { specialistId?: string; consultationType?: ConsultationType }) {
    return this.prisma.specialistAvailability.findMany({
      where: {
        isBooked: false,
        startTime: { gte: new Date() },
        specialist: { status: SpecialistStatus.approved },
        ...(filters.specialistId ? { specialistId: filters.specialistId } : {}),
        ...(filters.consultationType ? { consultationType: filters.consultationType } : {}),
      },
      include: {
        specialist: { select: { id: true, specialty: true, yearsExperience: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  private async getSpecialistOrThrow(userId: string) {
    const specialist = await this.prisma.specialist.findUnique({ where: { userId } });
    if (!specialist) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'لم تُنشئي ملفًا مهنيًا بعد',
        en: 'You have not created a professional profile yet',
      });
    }
    return specialist;
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    );
  }
}
