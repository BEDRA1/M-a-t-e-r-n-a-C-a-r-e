import { HttpStatus, Injectable } from '@nestjs/common';
import { SpecialistStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { CreateSpecialistAccountDto } from './dto/create-specialist-account.dto';

const SALT_ROUNDS = 10;

// الحقول الآمنة للمستخدم في كل استجابات الإدارة — لا passwordHash ولا refreshTokens أبدًا
const SAFE_USER_SELECT = {
  id: true,
  phone: true,
  email: true,
  role: true,
  wilaya: true,
  isActive: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // select صريح لا include — passwordHash وrefreshTokens والبريد وتاريخ الميلاد لا تخرج أبدًا من هنا
  listAll(role?: UserRole) {
    return this.prisma.user.findMany({
      where: role ? { role } : {},
      select: {
        id: true,
        phone: true,
        role: true,
        wilaya: true,
        isActive: true,
        createdAt: true,
        _count: { select: { bookingsMade: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ما يحتاجه الأدمن للتشغيل فقط. مستبعد عمدًا: نتائج التقييمات النفسية، سجل المزاج، الملاحظات
  // الكلينيكية، إجابات استبيان الحجز (questionnaireAnswers)، ومراجع مزوّد الدفع
  async getDetails(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...SAFE_USER_SELECT,
        specialistProfile: {
          select: { id: true, fullName: true, specialty: true, track: true, status: true, yearsExperience: true },
        },
        bookingsMade: {
          select: {
            id: true,
            status: true,
            consultationType: true,
            paymentStatus: true,
            createdAt: true,
            specialist: { select: { id: true, fullName: true } },
            availabilitySlot: { select: { startTime: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        subscriptions: {
          select: {
            id: true,
            status: true,
            startedAt: true,
            expiresAt: true,
            bookingCreditsRemaining: true,
            courseCreditsRemaining: true,
            plan: { select: { id: true, code: true, nameAr: true, price: true } },
            transactions: { select: { id: true, amount: true, paymentMethod: true, status: true, createdAt: true } },
          },
          orderBy: { startedAt: 'desc' },
        },
        mealOrders: {
          select: { id: true, status: true, totalPrice: true, preferredTime: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
        productOrders: {
          select: { id: true, status: true, totalPrice: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
        serviceBookings: {
          select: { id: true, status: true, scheduledTime: true, createdAt: true, service: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!user) {
      throw new AppException(HttpStatus.NOT_FOUND, { ar: 'المستخدم غير موجود', en: 'User not found' });
    }
    return user;
  }

  async setActive(adminUserId: string, id: string, isActive: boolean) {
    if (id === adminUserId && !isActive) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'لا يمكنك تعطيل حسابك بنفسك',
        en: 'You cannot disable your own account',
      });
    }
    await this.getOrThrow(id);
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({ where: { id }, data: { isActive }, select: SAFE_USER_SELECT });
      if (!isActive) {
        // حذف فعلي (لا revoked) — لا جلسة قابلة للتجديد تبقى لحساب معطّل؛ access token الحالي
        // يُرفض فورًا أيضًا لأن JwtStrategy يتحقق من isActive في كل طلب
        await tx.refreshToken.deleteMany({ where: { userId: id } });
      }
      return user;
    });
  }

  async changeRole(adminUserId: string, id: string, role: UserRole) {
    if (id === adminUserId && role !== UserRole.admin) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'لا يمكنك إزالة صلاحية الإدارة عن حسابك بنفسك',
        en: 'You cannot remove the admin role from your own account',
      });
    }
    const existing = await this.getOrThrow(id);
    if (existing.role === role) {
      return this.prisma.user.findUniqueOrThrow({ where: { id }, select: SAFE_USER_SELECT });
    }
    return this.prisma.$transaction(async (tx) => {
      // ملف أخصائية معتمد لحساب لم يعد أخصائية سيبقى ظاهرًا ويستقبل حجوزات — يُرفض تلقائيًا،
      // ويعود اعتماده يدويًا من صفحة الأخصائيات إن أُعيد الدور لاحقًا
      if (existing.role === UserRole.specialist) {
        await tx.specialist.updateMany({
          where: { userId: id, status: SpecialistStatus.approved },
          data: { status: SpecialistStatus.rejected },
        });
      }
      return tx.user.update({ where: { id }, data: { role }, select: SAFE_USER_SELECT });
    });
  }

  async createSpecialistAccount(dto: CreateSpecialistAccountDto) {
    const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existing) {
      throw new AppException(HttpStatus.CONFLICT, {
        ar: 'رقم الهاتف مسجّل مسبقًا',
        en: 'Phone number is already registered',
      });
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    return this.prisma.user.create({
      data: {
        phone: dto.phone,
        passwordHash,
        role: UserRole.specialist,
        wilaya: dto.wilaya,
        specialistProfile: {
          create: {
            fullName: dto.fullName,
            specialty: dto.specialty,
            track: dto.track,
            bio: dto.bio ?? '',
            yearsExperience: dto.yearsExperience ?? 0,
            // أُنشئ من الإدارة نفسها — لا معنى لمروره بطابور المراجعة
            status: SpecialistStatus.approved,
          },
        },
      },
      select: {
        ...SAFE_USER_SELECT,
        specialistProfile: { select: { id: true, fullName: true, specialty: true, track: true, status: true } },
      },
    });
  }

  private async getOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
    if (!user) {
      throw new AppException(HttpStatus.NOT_FOUND, { ar: 'المستخدم غير موجود', en: 'User not found' });
    }
    return user;
  }
}
