import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { BroadcastService } from './broadcast.service';
import { BroadcastAudienceQueryDto, SendBroadcastDto } from './dto/broadcast.dto';

@ApiBearerAuth()
@ApiTags('admin-broadcast')
@Controller('api/v1/admin/broadcast')
@Roles(UserRole.admin)
@UseGuards(RolesGuard)
export class BroadcastController {
  constructor(private readonly broadcastService: BroadcastService) {}

  @Get('recipients')
  @ApiOperation({ summary: 'عدد المستلمين المتوقَّع لفئة قبل الإرسال' })
  recipients(@Query() query: BroadcastAudienceQueryDto) {
    return this.broadcastService.countRecipients(query.audience);
  }

  // حد منخفض: نقرة مزدوجة أو إعادة إرسال بالخطأ تعني إشعارًا مكررًا لكل المستخدمين
  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: 'إرسال إشعار جماعي لفئة — سجل Notification لكل مستلم' })
  send(@CurrentUser() user: AuthenticatedUser, @Body() dto: SendBroadcastDto) {
    return this.broadcastService.send(user.userId, dto);
  }
}
