import { HttpStatus, Injectable } from '@nestjs/common';
import { MealOrderStatus, MealType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { CreateMealOrderDto } from './dto/create-meal-order.dto';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

const MEAL_TYPE_ORDER: Record<MealType, number> = { lunch: 0, dinner: 1 };

const ALLOWED_ORDER_TRANSITIONS: Record<MealOrderStatus, MealOrderStatus[]> = {
  pending: [MealOrderStatus.confirmed, MealOrderStatus.cancelled],
  confirmed: [MealOrderStatus.out_for_delivery, MealOrderStatus.cancelled],
  out_for_delivery: [MealOrderStatus.delivered],
  delivered: [],
  cancelled: [],
};

@Injectable()
export class NutritionService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentWeekMeals() {
    const weekStartDate = this.getCurrentWeekStart();
    const meals = await this.prisma.weeklyMeal.findMany({ where: { weekStartDate } });
    return meals.sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return MEAL_TYPE_ORDER[a.mealType] - MEAL_TYPE_ORDER[b.mealType];
    });
  }

  async createOrder(userId: string, dto: CreateMealOrderDto) {
    const mealIds = [...new Set(dto.items.map((item) => item.mealId))];
    const meals = await this.prisma.weeklyMeal.findMany({ where: { id: { in: mealIds } } });
    if (meals.length !== mealIds.length) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'إحدى الوجبات المطلوبة غير موجودة',
        en: 'One of the requested meals was not found',
      });
    }
    const mealsById = new Map(meals.map((meal) => [meal.id, meal]));

    // السعر الإجمالي والسعر لكل عنصر يُحسبان هنا حصرًا من سعر الوجبة الحالي في قاعدة البيانات —
    // أي حقل سعر يُرسله العميل (dto.totalPrice) لا يُقرأ في أي مكان بهذا الملف عمدًا
    let totalPrice = 0;
    const itemsData = dto.items.map((item) => {
      const meal = mealsById.get(item.mealId)!;
      totalPrice += meal.price * item.quantity;
      return { mealId: item.mealId, quantity: item.quantity, unitPrice: meal.price };
    });

    return this.prisma.mealOrder.create({
      data: {
        userId,
        totalPrice,
        deliveryAddress: dto.deliveryAddress,
        preferredTime: new Date(dto.preferredTime),
        items: { create: itemsData },
      },
      include: { items: { include: { meal: true } } },
    });
  }

  listMine(userId: string) {
    return this.prisma.mealOrder.findMany({
      where: { userId },
      include: { items: { include: { meal: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(user: AuthenticatedUser, orderId: string) {
    const order = await this.getOrderOrThrow(orderId);
    if (order.userId !== user.userId && user.role !== 'admin') {
      throw new AppException(HttpStatus.FORBIDDEN, {
        ar: 'ليس لديك صلاحية الوصول إلى هذا الطلب',
        en: 'You do not have permission to access this order',
      });
    }
    return order;
  }

  async updateStatus(orderId: string, status: MealOrderStatus) {
    const order = await this.getOrderOrThrow(orderId);
    if (!ALLOWED_ORDER_TRANSITIONS[order.status].includes(status)) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: `لا يمكن الانتقال من حالة "${order.status}" إلى "${status}"`,
        en: `Cannot transition from "${order.status}" to "${status}"`,
      });
    }
    return this.prisma.mealOrder.update({ where: { id: order.id }, data: { status } });
  }

  async cancel(userId: string, orderId: string) {
    const order = await this.getOrderOrThrow(orderId);
    if (order.userId !== userId) {
      throw new AppException(HttpStatus.FORBIDDEN, {
        ar: 'ليس لديك صلاحية إلغاء هذا الطلب',
        en: 'You do not have permission to cancel this order',
      });
    }
    if (order.status !== MealOrderStatus.pending && order.status !== MealOrderStatus.confirmed) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'لا يمكن إلغاء طلب في هذه الحالة',
        en: 'Cannot cancel an order in its current status',
      });
    }
    return this.prisma.mealOrder.update({
      where: { id: order.id },
      data: { status: MealOrderStatus.cancelled },
    });
  }

  private async getOrderOrThrow(orderId: string) {
    const order = await this.prisma.mealOrder.findUnique({
      where: { id: orderId },
      include: { items: { include: { meal: true } } },
    });
    if (!order) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'الطلب غير موجود',
        en: 'Order not found',
      });
    }
    return order;
  }

  /** بداية الأسبوع الحالي: الأحد 00:00 بتوقيت UTC، بنفس ترميز dayOfWeek (0 = الأحد) */
  private getCurrentWeekStart(): Date {
    const now = new Date();
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - now.getUTCDay()),
    );
  }
}
