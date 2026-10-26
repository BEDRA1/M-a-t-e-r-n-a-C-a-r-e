import { HttpStatus, Injectable } from '@nestjs/common';
import { ConsultationType, MealType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateMealDto, UpdateMealDto } from './dto/meal.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CreateDailyTipDto, UpdateDailyTipDto } from './dto/daily-tip.dto';
import { AdminUpdateCourseDto } from './dto/admin-update-course.dto';

const MEAL_TYPE_ORDER: Record<MealType, number> = { lunch: 0, dinner: 1 };

function notFound(ar: string, en: string): never {
  throw new AppException(HttpStatus.NOT_FOUND, { ar, en });
}

/** بداية الأسبوع الحالي (الأحد 00:00 UTC) — نفس تعريف weekStartDate في الـschema */
function currentWeekStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - now.getUTCDay()));
}

// لا حذف نهائي لأي محتوى هنا: الإخفاء عبر isActive فقط، فتبقى الطلبات السابقة مرتبطة بعناصرها
@Injectable()
export class AdminContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  // ── الوجبات
  async listMeals() {
    const meals = await this.prisma.weeklyMeal.findMany();
    return meals.sort((a, b) =>
      a.dayOfWeek !== b.dayOfWeek ? a.dayOfWeek - b.dayOfWeek : MEAL_TYPE_ORDER[a.mealType] - MEAL_TYPE_ORDER[b.mealType],
    );
  }

  createMeal(dto: CreateMealDto) {
    return this.prisma.weeklyMeal.create({
      data: { ...dto, imageUrl: dto.imageUrl ?? null, weekStartDate: currentWeekStart() },
    });
  }

  async updateMeal(id: string, dto: UpdateMealDto) {
    const meal = await this.prisma.weeklyMeal.findUnique({ where: { id } });
    if (!meal) notFound('الوجبة غير موجودة', 'Meal not found');
    return this.prisma.weeklyMeal.update({ where: { id }, data: dto });
  }

  // ── المتجر
  listProducts() {
    return this.prisma.product.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });
  }

  createProduct(dto: CreateProductDto) {
    return this.prisma.product.create({ data: { ...dto, imageUrl: dto.imageUrl ?? null } });
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) notFound('المنتج غير موجود', 'Product not found');
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  // ── النصائح اليومية
  listDailyTips() {
    return this.prisma.dailyTip.findMany({ orderBy: { tipNumber: 'asc' } });
  }

  async createDailyTip(dto: CreateDailyTipDto) {
    const { _max } = await this.prisma.dailyTip.aggregate({ _max: { tipNumber: true } });
    return this.prisma.dailyTip.create({ data: { tipTextAr: dto.tipTextAr, tipNumber: (_max.tipNumber ?? 0) + 1 } });
  }

  async updateDailyTip(id: string, dto: UpdateDailyTipDto) {
    const tip = await this.prisma.dailyTip.findUnique({ where: { id } });
    if (!tip) notFound('النصيحة غير موجودة', 'Tip not found');
    return this.prisma.dailyTip.update({ where: { id }, data: dto });
  }

  // ── الدورات
  listCourses() {
    return this.prisma.course.findMany({
      include: { specialist: { select: { id: true, fullName: true } } },
      orderBy: { startDate: 'desc' },
    });
  }

  async updateCourse(id: string, dto: AdminUpdateCourseDto) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) notFound('الدورة غير موجودة', 'Course not found');

    if (dto.capacity !== undefined) {
      if (course.type !== ConsultationType.in_person) {
        throw new AppException(HttpStatus.BAD_REQUEST, {
          ar: 'السعة تخص الدورات الحضورية فقط',
          en: 'Capacity applies to in-person courses only',
        });
      }
      if (dto.capacity < course.enrolledCount) {
        throw new AppException(HttpStatus.BAD_REQUEST, {
          ar: `لا يمكن تقليل السعة إلى أقل من عدد المسجلات حاليًا (${course.enrolledCount})`,
          en: `Capacity cannot be below current enrollments (${course.enrolledCount})`,
        });
      }
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        imageUrl: dto.imageUrl,
        capacity: dto.capacity,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      },
    });
  }

  // ── الأسعار تُقرأ عند إنشاء حجز/دورة/اشتراك جديد فقط. القائم منها يحمل لقطة سعره
  // (booking.price، course.price، subscription_transactions.amount) فلا يتأثر بالتعديل
  async listPricing() {
    const [services, plans] = await Promise.all([
      this.prisma.servicePricing.findMany({ orderBy: [{ serviceKind: 'asc' }, { consultationType: 'asc' }] }),
      this.prisma.subscriptionPlan.findMany({
        select: { id: true, code: true, nameAr: true, price: true, currency: true, type: true },
        orderBy: { price: 'asc' },
      }),
    ]);
    return { services, plans };
  }

  async updateServicePrice(adminUserId: string, id: string, price: number) {
    const row = await this.prisma.servicePricing.findUnique({ where: { id } });
    if (!row) notFound('السعر غير موجود', 'Price not found');
    const updated = await this.prisma.servicePricing.update({ where: { id }, data: { price } });
    await this.auditLog.record({
      adminUserId,
      action: 'update_service_price',
      entityType: 'service_pricing',
      entityId: id,
      details: { serviceKind: row.serviceKind, consultationType: row.consultationType, from: row.price, to: price },
    });
    return updated;
  }

  async updatePlanPrice(adminUserId: string, id: string, price: number) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) notFound('الباقة غير موجودة', 'Plan not found');
    const updated = await this.prisma.subscriptionPlan.update({
      where: { id },
      data: { price },
      select: { id: true, code: true, nameAr: true, price: true, currency: true, type: true },
    });
    await this.auditLog.record({
      adminUserId,
      action: 'update_plan_price',
      entityType: 'subscription_plan',
      entityId: id,
      details: { code: plan.code, from: plan.price, to: price },
    });
    return updated;
  }
}
