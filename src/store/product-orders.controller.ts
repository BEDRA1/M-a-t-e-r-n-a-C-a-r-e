import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { StoreService } from './store.service';
import { CreateProductOrderDto } from './dto/create-product-order.dto';
import { UpdateProductOrderStatusDto } from './dto/update-product-order-status.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuditLog } from '../audit-log/decorators/audit-log.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiBearerAuth()
@ApiTags('product-orders')
@Controller('api/v1/product-orders')
export class ProductOrdersController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @Roles(UserRole.mother, UserRole.spouse)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'طلب منتجات — السعر يُحسب من الخادم والمخزون يُخصم ذريًا' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateProductOrderDto) {
    return this.storeService.createOrder(user.userId, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'طلباتي' })
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.storeService.listMine(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل طلب (المالك أو admin فقط)' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.storeService.findOrder(user, id);
  }

  @Patch(':id/status')
  @Roles(UserRole.admin)
  @UseGuards(RolesGuard)
  @AuditLog('update_product_order_status', 'product_order')
  @ApiOperation({ summary: 'تحديث حالة الطلب (admin فقط)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateProductOrderStatusDto) {
    return this.storeService.updateStatus(id, dto.status);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'إلغاء طلب (المالك فقط، إن كان pending أو confirmed) — يُعيد المخزون تلقائيًا' })
  cancel(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.storeService.cancel(user.userId, id);
  }
}
