import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditLog } from '../audit-log/decorators/audit-log.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AdminContentService } from './admin-content.service';
import { CreateMealDto, UpdateMealDto } from './dto/meal.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CreateDailyTipDto, UpdateDailyTipDto } from './dto/daily-tip.dto';
import { AdminUpdateCourseDto } from './dto/admin-update-course.dto';
import { UpdatePriceDto } from './dto/update-price.dto';

@ApiBearerAuth()
@ApiTags('admin-meals')
@Controller('api/v1/admin/weekly-meals')
@Roles(UserRole.admin)
@UseGuards(RolesGuard)
export class AdminMealsController {
  constructor(private readonly service: AdminContentService) {}

  @Get()
  @ApiOperation({ summary: 'كل الوجبات (الظاهرة والمخفية)' })
  list() {
    return this.service.listMeals();
  }

  @Post()
  @AuditLog('create_meal', 'weekly_meal')
  create(@Body() dto: CreateMealDto) {
    return this.service.createMeal(dto);
  }

  @Patch(':id')
  @AuditLog('update_meal', 'weekly_meal')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMealDto) {
    return this.service.updateMeal(id, dto);
  }
}

@ApiBearerAuth()
@ApiTags('admin-products')
@Controller('api/v1/admin/products')
@Roles(UserRole.admin)
@UseGuards(RolesGuard)
export class AdminProductsController {
  constructor(private readonly service: AdminContentService) {}

  @Get()
  @ApiOperation({ summary: 'كل المنتجات (الظاهرة والمخفية)' })
  list() {
    return this.service.listProducts();
  }

  @Post()
  @AuditLog('create_product', 'product')
  create(@Body() dto: CreateProductDto) {
    return this.service.createProduct(dto);
  }

  @Patch(':id')
  @AuditLog('update_product', 'product')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.service.updateProduct(id, dto);
  }
}

@ApiBearerAuth()
@ApiTags('admin-daily-tips')
@Controller('api/v1/admin/daily-tips')
@Roles(UserRole.admin)
@UseGuards(RolesGuard)
export class AdminDailyTipsController {
  constructor(private readonly service: AdminContentService) {}

  @Get()
  list() {
    return this.service.listDailyTips();
  }

  @Post()
  @AuditLog('create_daily_tip', 'daily_tip')
  create(@Body() dto: CreateDailyTipDto) {
    return this.service.createDailyTip(dto);
  }

  @Patch(':id')
  @AuditLog('update_daily_tip', 'daily_tip')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDailyTipDto) {
    return this.service.updateDailyTip(id, dto);
  }
}

@ApiBearerAuth()
@ApiTags('admin-courses')
@Controller('api/v1/admin/courses')
@Roles(UserRole.admin)
@UseGuards(RolesGuard)
export class AdminCoursesController {
  constructor(private readonly service: AdminContentService) {}

  @Get()
  list() {
    return this.service.listCourses();
  }

  @Patch(':id')
  @AuditLog('admin_update_course', 'course')
  @ApiOperation({ summary: 'تعديل محتوى دورة وموعدها وسعتها (بلا تغيير النوع أو السعر)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AdminUpdateCourseDto) {
    return this.service.updateCourse(id, dto);
  }
}

// سجل النشاط هنا يُكتب داخل الخدمة لا بـ@AuditLog، لأنه يحتاج السعر القديم والجديد معًا
@ApiBearerAuth()
@ApiTags('admin-pricing')
@Controller('api/v1/admin/pricing')
@Roles(UserRole.admin)
@UseGuards(RolesGuard)
export class AdminPricingController {
  constructor(private readonly service: AdminContentService) {}

  @Get()
  @ApiOperation({ summary: 'أسعار الخدمات (service_pricing) وأسعار الباقات' })
  list() {
    return this.service.listPricing();
  }

  @Patch('services/:id')
  updateService(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePriceDto,
  ) {
    return this.service.updateServicePrice(user.userId, id, dto.price);
  }

  @Patch('plans/:id')
  updatePlan(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePriceDto,
  ) {
    return this.service.updatePlanPrice(user.userId, id, dto.price);
  }
}
