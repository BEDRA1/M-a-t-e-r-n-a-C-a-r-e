import { HttpStatus, Injectable } from '@nestjs/common';
import { ReminderType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RemindersService } from '../reminders/reminders.service';
import { AppException } from '../common/exceptions/app.exception';
import { CreateBabyDto } from './dto/create-baby.dto';
import { UpdateBabyDto } from './dto/update-baby.dto';
import { CreateCheckupDto } from './dto/create-checkup.dto';
import { UpdateCheckupDto } from './dto/update-checkup.dto';

@Injectable()
export class BabiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly remindersService: RemindersService,
  ) {}

  async create(userId: string, dto: CreateBabyDto) {
    const familyId = await this.resolveFamilyId(userId);
    return this.prisma.baby.create({
      data: {
        familyId,
        fullName: dto.fullName,
        birthDate: new Date(dto.birthDate),
        gender: dto.gender,
        weightGrams: dto.weightGrams,
        heightCm: dto.heightCm,
      },
    });
  }

  async findAll(userId: string) {
    const familyId = await this.resolveFamilyId(userId);
    return this.prisma.baby.findMany({ where: { familyId }, orderBy: { birthDate: 'desc' } });
  }

  async findOne(userId: string, babyId: string) {
    const baby = await this.getOwnedBabyOrThrow(userId, babyId);
    const checkups = await this.prisma.babyCheckup.findMany({
      where: { babyId: baby.id },
      orderBy: { scheduledDate: 'asc' },
    });
    return { ...baby, checkups };
  }

  async update(userId: string, babyId: string, dto: UpdateBabyDto) {
    const baby = await this.getOwnedBabyOrThrow(userId, babyId);
    return this.prisma.baby.update({
      where: { id: baby.id },
      data: {
        fullName: dto.fullName ?? baby.fullName,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : baby.birthDate,
        gender: dto.gender ?? baby.gender,
        weightGrams: dto.weightGrams ?? baby.weightGrams,
        heightCm: dto.heightCm ?? baby.heightCm,
      },
    });
  }

  async remove(userId: string, babyId: string) {
    const baby = await this.getOwnedBabyOrThrow(userId, babyId);
    // الحذف يُسقط سجلات الفحوصات المرتبطة تلقائيًا (onDelete: Cascade في الـschema)،
    // لكن أي تذكيرات مرتبطة بها تبقى قائمة — لم يُطلَب تنظيفها عند حذف طفل بأكمله،
    // فقط عند تحديث/حذف فحص بعينه (موثّق في الملخص النهائي).
    await this.prisma.baby.delete({ where: { id: baby.id } });
    return { deleted: true };
  }

  async createCheckup(userId: string, babyId: string, dto: CreateCheckupDto) {
    const baby = await this.getOwnedBabyOrThrow(userId, babyId);
    const scheduledDate = new Date(dto.scheduledDate);
    const linkedReminderId = this.isFuture(scheduledDate)
      ? (await this.createLinkedReminder(userId, baby.fullName, dto.title, scheduledDate)).id
      : null;

    return this.prisma.babyCheckup.create({
      data: {
        babyId: baby.id,
        title: dto.title,
        scheduledDate,
        notes: dto.notes,
        completed: dto.completed ?? false,
        linkedReminderId,
      },
    });
  }

  async listCheckups(userId: string, babyId: string) {
    const baby = await this.getOwnedBabyOrThrow(userId, babyId);
    return this.prisma.babyCheckup.findMany({
      where: { babyId: baby.id },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async updateCheckup(userId: string, babyId: string, checkupId: string, dto: UpdateCheckupDto) {
    const baby = await this.getOwnedBabyOrThrow(userId, babyId);
    const checkup = await this.getOwnedCheckupOrThrow(baby.id, checkupId);

    const scheduledDate = dto.scheduledDate ? new Date(dto.scheduledDate) : checkup.scheduledDate;
    const title = dto.title ?? checkup.title;
    const shouldHaveReminder = this.isFuture(scheduledDate);

    let linkedReminderId = checkup.linkedReminderId;
    if (shouldHaveReminder && linkedReminderId) {
      await this.remindersService.update(userId, linkedReminderId, {
        title: this.reminderTitle(baby.fullName, title),
        scheduledTime: scheduledDate.toISOString(),
      });
    } else if (shouldHaveReminder && !linkedReminderId) {
      linkedReminderId = (await this.createLinkedReminder(userId, baby.fullName, title, scheduledDate)).id;
    } else if (!shouldHaveReminder && linkedReminderId) {
      await this.remindersService.remove(userId, linkedReminderId);
      linkedReminderId = null;
    }

    return this.prisma.babyCheckup.update({
      where: { id: checkup.id },
      data: {
        title,
        scheduledDate,
        notes: dto.notes ?? checkup.notes,
        completed: dto.completed ?? checkup.completed,
        linkedReminderId,
      },
    });
  }

  async removeCheckup(userId: string, babyId: string, checkupId: string) {
    const baby = await this.getOwnedBabyOrThrow(userId, babyId);
    const checkup = await this.getOwnedCheckupOrThrow(baby.id, checkupId);

    if (checkup.linkedReminderId) {
      await this.remindersService.remove(userId, checkup.linkedReminderId);
    }
    await this.prisma.babyCheckup.delete({ where: { id: checkup.id } });
    return { deleted: true };
  }

  private isFuture(date: Date): boolean {
    return date.getTime() > Date.now();
  }

  private reminderTitle(babyName: string, checkupTitle: string): string {
    return `فحص ${babyName}: ${checkupTitle}`;
  }

  private createLinkedReminder(userId: string, babyName: string, checkupTitle: string, scheduledDate: Date) {
    return this.remindersService.create(userId, {
      type: ReminderType.appointment,
      title: this.reminderTitle(babyName, checkupTitle),
      scheduledTime: scheduledDate.toISOString(),
    });
  }

  private async resolveFamilyId(userId: string): Promise<string> {
    const family = await this.prisma.family.findFirst({
      where: { OR: [{ motherUserId: userId }, { spouseUserId: userId }] },
    });
    if (!family) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'أنت غير مرتبط بأي عائلة',
        en: 'You are not linked to any family',
      });
    }
    return family.id;
  }

  private async getOwnedBabyOrThrow(userId: string, babyId: string) {
    const familyId = await this.resolveFamilyId(userId);
    const baby = await this.prisma.baby.findUnique({ where: { id: babyId } });
    if (!baby || baby.familyId !== familyId) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'الطفل غير موجود',
        en: 'Baby not found',
      });
    }
    return baby;
  }

  private async getOwnedCheckupOrThrow(babyId: string, checkupId: string) {
    const checkup = await this.prisma.babyCheckup.findUnique({ where: { id: checkupId } });
    if (!checkup || checkup.babyId !== babyId) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'الفحص غير موجود',
        en: 'Checkup not found',
      });
    }
    return checkup;
  }
}
