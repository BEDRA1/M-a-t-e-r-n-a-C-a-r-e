import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@Injectable()
export class RemindersService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateReminderDto) {
    return this.prisma.reminder.create({
      data: {
        userId,
        type: dto.type,
        title: dto.title,
        scheduledTime: new Date(dto.scheduledTime),
        recurrence: dto.recurrence,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.reminder.findMany({
      where: { userId },
      orderBy: { scheduledTime: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const reminder = await this.getOwnedOrThrow(userId, id);
    return reminder;
  }

  async update(userId: string, id: string, dto: UpdateReminderDto) {
    const reminder = await this.getOwnedOrThrow(userId, id);
    return this.prisma.reminder.update({
      where: { id: reminder.id },
      data: {
        type: dto.type ?? reminder.type,
        title: dto.title ?? reminder.title,
        scheduledTime: dto.scheduledTime ? new Date(dto.scheduledTime) : reminder.scheduledTime,
        recurrence: dto.recurrence ?? reminder.recurrence,
        isDone: dto.isDone ?? reminder.isDone,
      },
    });
  }

  async remove(userId: string, id: string) {
    const reminder = await this.getOwnedOrThrow(userId, id);
    await this.prisma.reminder.delete({ where: { id: reminder.id } });
    return { deleted: true };
  }

  private async getOwnedOrThrow(userId: string, id: string) {
    const reminder = await this.prisma.reminder.findUnique({ where: { id } });
    if (!reminder || reminder.userId !== userId) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'التذكير غير موجود',
        en: 'Reminder not found',
      });
    }
    return reminder;
  }
}
