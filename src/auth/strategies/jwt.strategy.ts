import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException } from '../../common/exceptions/app.exception';
import type { AuthenticatedUser } from '../types/authenticated-user.type';

interface JwtPayload {
  sub: string;
  phone: string;
  role: AuthenticatedUser['role'];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
    });
  }

  // قراءة واحدة خفيفة لكل طلب: بدونها يبقى access token لحساب معطّل صالحًا حتى انتهائه (15 دقيقة)،
  // ويبقى الدور القديم في التوكن بعد تغييره من الإدارة — الدور يُؤخذ من القاعدة لا من التوكن
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, phone: true, role: true, isActive: true },
    });
    if (!user || !user.isActive) {
      throw new AppException(HttpStatus.UNAUTHORIZED, {
        ar: 'الجلسة غير صالحة أو الحساب معطّل',
        en: 'Session invalid or account disabled',
      });
    }
    return { userId: user.id, phone: user.phone, role: user.role };
  }
}
