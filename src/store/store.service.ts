import { HttpStatus, Injectable } from '@nestjs/common';
import { ProductOrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { CreateProductOrderDto } from './dto/create-product-order.dto';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

const ALLOWED_ORDER_TRANSITIONS: Record<ProductOrderStatus, ProductOrderStatus[]> = {
  pending: [ProductOrderStatus.confirmed, ProductOrderStatus.cancelled],
  confirmed: [ProductOrderStatus.shipped, ProductOrderStatus.cancelled],
  shipped: [ProductOrderStatus.delivered],
  delivered: [],
  cancelled: [],
};

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  listProducts(filters: { category?: string; inStockOnly?: boolean }) {
    return this.prisma.product.findMany({
      where: {
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.inStockOnly ? { stockQuantity: { gt: 0 } } : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findProduct(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new AppException(HttpStatus.NOT_FOUND, { ar: 'المنتج غير موجود', en: 'Product not found' });
    }
    return product;
  }

  async createOrder(userId: string, dto: CreateProductOrderDto) {
    const productIds = [...new Set(dto.items.map((item) => item.productId))];
    const products = await this.prisma.product.findMany({ where: { id: { in: productIds } } });
    if (products.length !== productIds.length) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'أحد المنتجات المطلوبة غير موجود',
        en: 'One of the requested products was not found',
      });
    }
    const productsById = new Map(products.map((product) => [product.id, product]));

    // السعر الإجمالي ولكل عنصر يُحسبان هنا حصرًا من سعر المنتج الحالي في قاعدة البيانات —
    // أي حقل سعر يُرسله العميل (dto.totalPrice) لا يُقرأ في أي مكان بهذا الملف عمدًا
    let totalPrice = 0;
    const itemsData = dto.items.map((item) => {
      const product = productsById.get(item.productId)!;
      totalPrice += product.price * item.quantity;
      return { productId: item.productId, quantity: item.quantity, unitPrice: product.price };
    });

    return this.prisma.$transaction(async (tx) => {
      // خصم مخزون ذري لكل عنصر على حدة: تحديث SQL شرطي واحد (stockQuantity >= quantity) يقفل
      // الصف حتى الـcommit — نفس فلسفة enrolledCount في CoursesService بالضبط. أي فشل هنا
      // (حتى لو كان العنصر الثالث من ثلاثة) يُسقط المعاملة كاملة، فلا تُخصم أي كمية لأي عنصر
      // آخر من نفس الطلب — لا طلب جزئي أبدًا.
      for (const item of dto.items) {
        const product = productsById.get(item.productId)!;
        const stockResult = await tx.product.updateMany({
          where: { id: item.productId, stockQuantity: { gte: item.quantity } },
          data: { stockQuantity: { decrement: item.quantity } },
        });
        if (stockResult.count === 0) {
          throw new AppException(HttpStatus.CONFLICT, {
            ar: `الكمية المطلوبة من "${product.name}" غير متوفرة في المخزون`,
            en: `The requested quantity of "${product.name}" is not available in stock`,
          });
        }
      }

      return tx.productOrder.create({
        data: {
          userId,
          totalPrice,
          deliveryAddress: dto.deliveryAddress,
          items: { create: itemsData },
        },
        include: { items: { include: { product: true } } },
      });
    });
  }

  listMine(userId: string) {
    return this.prisma.productOrder.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOrder(user: AuthenticatedUser, orderId: string) {
    const order = await this.getOrderOrThrow(orderId);
    if (order.userId !== user.userId && user.role !== 'admin') {
      throw new AppException(HttpStatus.FORBIDDEN, {
        ar: 'ليس لديك صلاحية الوصول إلى هذا الطلب',
        en: 'You do not have permission to access this order',
      });
    }
    return order;
  }

  async updateStatus(orderId: string, status: ProductOrderStatus) {
    const order = await this.getOrderOrThrow(orderId);
    if (!ALLOWED_ORDER_TRANSITIONS[order.status].includes(status)) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: `لا يمكن الانتقال من حالة "${order.status}" إلى "${status}"`,
        en: `Cannot transition from "${order.status}" to "${status}"`,
      });
    }
    if (status === ProductOrderStatus.cancelled) {
      return this.restoreStockAndCancel(order.id);
    }
    return this.prisma.productOrder.update({ where: { id: order.id }, data: { status } });
  }

  async cancel(userId: string, orderId: string) {
    const order = await this.getOrderOrThrow(orderId);
    if (order.userId !== userId) {
      throw new AppException(HttpStatus.FORBIDDEN, {
        ar: 'ليس لديك صلاحية إلغاء هذا الطلب',
        en: 'You do not have permission to cancel this order',
      });
    }
    if (order.status !== ProductOrderStatus.pending && order.status !== ProductOrderStatus.confirmed) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'لا يمكن إلغاء طلب في هذه الحالة (الطلبات المشحونة لا تُلغى)',
        en: 'Cannot cancel an order in its current status (shipped orders cannot be cancelled)',
      });
    }
    return this.restoreStockAndCancel(order.id);
  }

  /** يُرجع كمية كل عنصر إلى المخزون ذريًا ثم يُلغي الطلب، في نفس الـtransaction — يشترك فيه
   * مسارا الإلغاء (owner) وتحديث الحالة إلى cancelled (admin)، بنفس بنية
   * releaseSlotAndCancel في bookings.service.ts */
  private restoreStockAndCancel(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.productOrder.findUniqueOrThrow({
        where: { id: orderId },
        include: { items: true },
      });
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }
      return tx.productOrder.update({
        where: { id: order.id },
        data: { status: ProductOrderStatus.cancelled },
      });
    });
  }

  private async getOrderOrThrow(orderId: string) {
    const order = await this.prisma.productOrder.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });
    if (!order) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'الطلب غير موجود',
        en: 'Order not found',
      });
    }
    return order;
  }
}
