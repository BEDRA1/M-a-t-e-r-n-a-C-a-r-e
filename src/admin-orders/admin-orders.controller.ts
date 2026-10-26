import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MealOrderStatus, ProductOrderStatus, ServiceBookingStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

// عدّادات فقط (بلا بيانات شخصية) لشارات الـsidebar وبطاقة "طلبات جديدة تنتظر" — طلب واحد خفيف
// بدل جلب القوائم الثلاث كاملة من كل صفحة في /admin
@ApiBearerAuth()
@ApiTags('admin-orders')
@Controller('api/v1/admin/order-counts')
export class AdminOrdersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles(UserRole.admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'عدد الطلبات الجديدة (pending) لكل نوع: الوجبات، المتجر، الخدمات المنزلية' })
  async pendingCounts() {
    const [mealOrders, productOrders, serviceBookings] = await Promise.all([
      this.prisma.mealOrder.count({ where: { status: MealOrderStatus.pending } }),
      this.prisma.productOrder.count({ where: { status: ProductOrderStatus.pending } }),
      this.prisma.serviceBooking.count({ where: { status: ServiceBookingStatus.pending } }),
    ]);
    return { mealOrders, productOrders, serviceBookings, total: mealOrders + productOrders + serviceBookings };
  }
}
