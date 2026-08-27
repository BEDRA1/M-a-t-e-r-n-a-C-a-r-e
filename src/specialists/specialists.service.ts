import { HttpStatus, Injectable } from '@nestjs/common';
import { SpecialistStatus, SpecialistTrack } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { RegisterSpecialistProfileDto } from './dto/register-specialist-profile.dto';
import { UpdateSpecialistProfileDto } from './dto/update-specialist-profile.dto';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class SpecialistsService {
  constructor(private readonly prisma: PrismaService) {}

  async registerProfile(userId: string, dto: RegisterSpecialistProfileDto) {
    const existing = await this.prisma.specialist.findUnique({ where: { userId } });
    if (existing) {
      throw new AppException(HttpStatus.CONFLICT, {
        ar: 'لديك ملف مهني بالفعل، استخدمي التعديل بدل الإنشاء',
        en: 'You already have a professional profile, use update instead',
      });
    }

    return this.prisma.specialist.create({
      data: { userId, ...dto, status: SpecialistStatus.pending },
    });
  }

  async listApproved(specialty?: string, track?: SpecialistTrack) {
    return this.prisma.specialist.findMany({
      where: {
        status: SpecialistStatus.approved,
        ...(specialty ? { specialty: { contains: specialty, mode: 'insensitive' } } : {}),
        ...(track ? { track } : {}),
      },
      include: { user: { select: { id: true, wilaya: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string, requester?: AuthenticatedUser) {
    const specialist = await this.prisma.specialist.findUnique({
      where: { id },
      include: { user: { select: { id: true, wilaya: true, phone: true } } },
    });
    if (!specialist) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'الأخصائي غير موجود',
        en: 'Specialist not found',
      });
    }

    const isOwner = requester?.userId === specialist.userId;
    const isAdmin = requester?.role === 'admin';
    if (specialist.status !== SpecialistStatus.approved && !isOwner && !isAdmin) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'الأخصائي غير موجود',
        en: 'Specialist not found',
      });
    }

    return specialist;
  }

  async updateMyProfile(userId: string, dto: UpdateSpecialistProfileDto) {
    const specialist = await this.getOwnProfileOrThrow(userId);
    return this.prisma.specialist.update({ where: { id: specialist.id }, data: dto });
  }

  async getMyProfile(userId: string) {
    return this.getOwnProfileOrThrow(userId);
  }

  async approve(id: string) {
    await this.getByIdOrThrowRaw(id);
    return this.prisma.specialist.update({
      where: { id },
      data: { status: SpecialistStatus.approved },
    });
  }

  async reject(id: string) {
    await this.getByIdOrThrowRaw(id);
    return this.prisma.specialist.update({
      where: { id },
      data: { status: SpecialistStatus.rejected },
    });
  }

  private async getOwnProfileOrThrow(userId: string) {
    const specialist = await this.prisma.specialist.findUnique({ where: { userId } });
    if (!specialist) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'لم تُنشئي ملفًا مهنيًا بعد',
        en: 'You have not created a professional profile yet',
      });
    }
    return specialist;
  }

  private async getByIdOrThrowRaw(id: string) {
    const specialist = await this.prisma.specialist.findUnique({ where: { id } });
    if (!specialist) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'الأخصائي غير موجود',
        en: 'Specialist not found',
      });
    }
    return specialist;
  }
}
