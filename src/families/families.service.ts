import { HttpStatus, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';

// نستبعد الأحرف المتشابهة بصريًا (0/O, 1/I) لتقليل أخطاء الإدخال اليدوي للكود
const INVITE_CODE_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const INVITE_CODE_LENGTH = 6;

@Injectable()
export class FamiliesService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrGetInvite(motherId: string) {
    const existing = await this.prisma.family.findUnique({ where: { motherUserId: motherId } });
    if (existing) {
      return existing;
    }

    const inviteCode = await this.generateUniqueInviteCode();
    return this.prisma.family.create({
      data: { motherUserId: motherId, inviteCode },
    });
  }

  async join(spouseId: string, inviteCode: string) {
    const family = await this.prisma.family.findUnique({ where: { inviteCode } });
    if (!family) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'كود الدعوة غير صحيح',
        en: 'Invalid invite code',
      });
    }

    if (family.spouseUserId) {
      throw new AppException(HttpStatus.CONFLICT, {
        ar: 'هذه العائلة مرتبطة بزوج بالفعل',
        en: 'This family is already linked to a spouse',
      });
    }

    if (family.motherUserId === spouseId) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'لا يمكنك الانضمام إلى عائلتك الخاصة',
        en: 'You cannot join your own family',
      });
    }

    const alreadyLinkedElsewhere = await this.prisma.family.findUnique({
      where: { spouseUserId: spouseId },
    });
    if (alreadyLinkedElsewhere) {
      throw new AppException(HttpStatus.CONFLICT, {
        ar: 'أنت مرتبط بعائلة أخرى بالفعل',
        en: 'You are already linked to another family',
      });
    }

    return this.prisma.family.update({
      where: { id: family.id },
      data: { spouseUserId: spouseId },
    });
  }

  async getMine(userId: string) {
    const family = await this.prisma.family.findFirst({
      where: { OR: [{ motherUserId: userId }, { spouseUserId: userId }] },
    });
    if (!family) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'لا توجد عائلة مرتبطة بهذا المستخدم',
        en: 'No family found for this user',
      });
    }
    return family;
  }

  async unlinkSpouse(motherId: string) {
    const family = await this.prisma.family.findUnique({ where: { motherUserId: motherId } });
    if (!family) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'لا توجد عائلة لهذا المستخدم',
        en: 'No family found for this user',
      });
    }
    if (!family.spouseUserId) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'لا يوجد زوج مرتبط لفكه',
        en: 'No spouse is currently linked',
      });
    }

    return this.prisma.family.update({
      where: { id: family.id },
      data: { spouseUserId: null },
    });
  }

  private async generateUniqueInviteCode(): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt++) {
      const code = this.randomCode();
      const exists = await this.prisma.family.findUnique({ where: { inviteCode: code } });
      if (!exists) {
        return code;
      }
    }
    throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, {
      ar: 'تعذر توليد كود دعوة فريد، حاول مرة أخرى',
      en: 'Failed to generate a unique invite code, please try again',
    });
  }

  private randomCode(): string {
    const bytes = randomBytes(INVITE_CODE_LENGTH);
    let code = '';
    for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
      code += INVITE_CODE_CHARSET[bytes[i] % INVITE_CODE_CHARSET.length];
    }
    return code;
  }
}
