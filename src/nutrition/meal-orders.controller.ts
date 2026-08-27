import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { NutritionService } from './nutrition.service';
import { CreateMealOrderDto } from './dto/create-meal-order.dto';
import { UpdateMealOrderStatusDto } from './dto/update-meal-order-status.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuditLog } from '../audit-log/decorators/audit-log.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiBearerAuth()
@ApiTags('meal-orders')
@Controller('api/v1/meal-orders')
export class MealOrdersController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post()
  @Roles(UserRole.mother, UserRole.spouse)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'طلب وجبات — السعر الإجمالي يُحسب دومًا من الخادم' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateMealOrderDto) {
    return this.nutritionService.createOrder(user.userId, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'طلباتي' })
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.nutritionService.listMine(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل طلب (المالك أو admin فقط)' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.nutritionService.findOne(user, id);
  }

  @Patch(':id/status')
  @Roles(UserRole.admin)
  @UseGuards(RolesGuard)
  @AuditLog('update_meal_order_status', 'meal_order')
  @ApiOperation({ summary: 'تحديث حالة الطلب (admin فقط)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateMealOrderStatusDto) {
    return this.nutritionService.updateStatus(id, dto.status);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'إلغاء طلب (المالك فقط، إن كان pending أو confirmed)' })
  cancel(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.nutritionService.cancel(user.userId, id);
  }
}
