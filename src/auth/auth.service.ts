import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { createHash } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { AuthenticatedUser } from './types/authenticated-user.type';

const SALT_ROUNDS = 10;
const REFRESH_TOKEN_TTL_DAYS = 7;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existing) {
      throw new AppException(HttpStatus.CONFLICT, {
        ar: 'رقم الهاتف مسجل مسبقاً',
        en: 'Phone number is already registered',
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        email: dto.email,
        passwordHash,
        role: dto.role,
        wilaya: dto.wilaya,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
    });

    const tokens = await this.issueTokenPair(user.id, user.phone, user.role);
    return { user: this.toSafeUser(user), ...tokens };
  }

  async login(dto: LoginDto, ip?: string) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) {
      await this.logFailedLoginAttempt(dto.phone, ip);
      throw new AppException(HttpStatus.UNAUTHORIZED, {
        ar: 'رقم الهاتف أو كلمة المرور غير صحيحة',
        en: 'Invalid phone number or password',
      });
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      await this.logFailedLoginAttempt(dto.phone, ip);
      throw new AppException(HttpStatus.UNAUTHORIZED, {
        ar: 'رقم الهاتف أو كلمة المرور غير صحيحة',
        en: 'Invalid phone number or password',
      });
    }

    const tokens = await this.issueTokenPair(user.id, user.phone, user.role);
    return { user: this.toSafeUser(user), ...tokens };
  }

  // لا يُسجَّل رقم الهاتف ولا كلمة المرور مطلقًا — sha256(phone) فقط للتتبع (رصد استهداف
  // متكرر لنفس الرقم) دون تخزين بيانات شخصية مباشرة. فشل التسجيل نفسه لا يُسقط تسجيل الدخول
  private async logFailedLoginAttempt(phone: string, ip?: string): Promise<void> {
    try {
      await this.prisma.loginAttemptLog.create({
        data: { phoneHash: this.hashToken(phone), ip: ip ?? null },
      });
    } catch {
      // متعمّد: فشل تسجيل محاولة الدخول الفاشلة لا يجب أن يكسر استجابة تسجيل الدخول نفسها
    }
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; phone: string; role: AuthenticatedUser['role'] };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new AppException(HttpStatus.UNAUTHORIZED, {
        ar: 'رمز التحديث غير صالح أو منتهي الصلاحية',
        en: 'Refresh token is invalid or expired',
      });
    }

    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { userId: payload.sub, tokenHash, revoked: false },
    });
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppException(HttpStatus.UNAUTHORIZED, {
        ar: 'رمز التحديث غير صالح أو منتهي الصلاحية',
        en: 'Refresh token is invalid or expired',
      });
    }

    // تدوير الرمز: إبطال القديم وإصدار زوج جديد لمنع إعادة الاستخدام
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new AppException(HttpStatus.UNAUTHORIZED, {
        ar: 'المستخدم غير موجود',
        en: 'User not found',
      });
    }

    return this.issueTokenPair(user.id, user.phone, user.role);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'المستخدم غير موجود',
        en: 'User not found',
      });
    }
    return this.toSafeUser(user);
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    // رقم الهاتف هو معرّف الحساب ولا يُعدَّل هنا عمداً — أي حقل غير مُرسل في dto يبقى
    // بقيمته الحالية لأن Prisma يتجاهل مفاتيح undefined في data
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { email: dto.email, wilaya: dto.wilaya },
    });
    return this.toSafeUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'المستخدم غير موجود',
        en: 'User not found',
      });
    }

    const currentMatches = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!currentMatches) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'كلمة المرور الحالية غير صحيحة',
        en: 'Current password is incorrect',
      });
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    // إبطال كل جلسات هذا المستخدم النشطة (لا الحالية فقط) — يجبر كل الأجهزة الأخرى على
    // إعادة تسجيل الدخول بالكلمة الجديدة. نفس نمط الإبطال الناعم (revoked: true) المستخدم
    // في refresh() لتدوير الرموز، لا حذف فعلي للصفوف
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });

    return { success: true };
  }

  private async issueTokenPair(
    userId: string,
    phone: string,
    role: AuthenticatedUser['role'],
  ): Promise<TokenPair> {
    const payload = { sub: userId, phone, role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: (this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ??
        '15m') as JwtSignOptions['expiresIn'],
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ??
        '7d') as JwtSignOptions['expiresIn'],
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private toSafeUser<T extends { passwordHash: string }>(user: T) {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
