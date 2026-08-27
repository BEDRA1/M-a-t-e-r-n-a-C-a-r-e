import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';
import { SubscriptionsService } from './subscriptions.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiBearerAuth()
@ApiTags('subscriptions')
@Controller('api/v1/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'قائمة الباقات الخمس المتاحة' })
  listPlans() {
    return this.subscriptionsService.listPlans();
  }

  // مسار الدفع الفعلي الوحيد حاليًا في المشروع (لا يوجد /subscriptions/pay/* منفصل) — يُحدَّد
  // بالمستخدم لا بالـIP (getTracker) لأن محاولات دفع متكررة من نفس الحساب عبر شبكات/أجهزة
  // مختلفة يجب أن تُحسَب معًا؛ يقع فورًا بعد JwtAuthGuard في سلسلة الحرّاس، فـrequest.user متاح دومًا هنا
  @Post('subscribe')
  @Roles(UserRole.mother, UserRole.spouse)
  @UseGuards(RolesGuard)
  @Throttle({
    default: {
      limit: 3,
      ttl: 600_000,
      getTracker: (req: Request) => Promise.resolve((req.user as AuthenticatedUser | undefined)?.userId ?? req.ip ?? 'unknown'),
    },
  })
  @ApiOperation({ summary: 'الاشتراك في باقة (محاكاة دفع Visa/BaridiMob)' })
  subscribe(@CurrentUser() user: AuthenticatedUser, @Body() dto: SubscribeDto) {
    return this.subscriptionsService.subscribe(user.userId, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'اشتراكاتي (الحالية والسابقة)' })
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.listMine(user.userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'إلغاء اشتراك نشط' })
  cancel(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.subscriptionsService.cancel(user.userId, id);
  }
}
