import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { SubscriptionStatus, TransactionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { PAYMENT_PROVIDER, type PaymentProvider } from '../payments/payment.provider';
import { SubscribeDto } from './dto/subscribe.dto';

const MONTHLY_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PAYMENT_PROVIDER) private readonly paymentProvider: PaymentProvider,
  ) {}

  listPlans() {
    return this.prisma.subscriptionPlan.findMany({ orderBy: { price: 'asc' } });
  }

  async subscribe(userId: string, dto: SubscribeDto) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { code: dto.planCode } });
    if (!plan) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'الباقة غير موجودة',
        en: 'Plan not found',
      });
    }

    const intent = await this.paymentProvider.createPaymentIntent({
      amount: plan.price,
      currency: plan.currency,
      method: dto.paymentMethod,
      metadata: { userId, planCode: plan.code },
    });

    const result = await this.paymentProvider.processPayment({
      intentId: intent.id,
      method: dto.paymentMethod,
      paymentData: dto.paymentData,
    });

    if (result.status !== 'succeeded') {
      // لا يوجد اشتراك بعد عند فشل الدفع، لذا لا يمكن تسجيل SubscriptionTransaction
      // (مرتبطة إلزاميًا بـuserSubscriptionId في الـschema) — نكتفي بإرجاع الخطأ للعميل.
      throw new AppException(HttpStatus.PAYMENT_REQUIRED, {
        ar: result.message ?? 'فشلت عملية الدفع',
        en: result.message ?? 'Payment failed',
      });
    }

    const startedAt = new Date();
    // one_time: بدون تاريخ انتهاء تلقائي — لا حقل مدة لكل باقة في الـschema لتمييز
    // "40 يومًا" لباقة النفاس مثلًا عن باقة أخرى one_time، فتُركت null بدل افتراض مدة غير موثّقة.
    const expiresAt = plan.type === 'monthly' ? new Date(startedAt.getTime() + MONTHLY_DURATION_MS) : null;

    return this.prisma.$transaction(async (tx) => {
      const subscription = await tx.userSubscription.create({
        data: {
          userId,
          planId: plan.id,
          status: SubscriptionStatus.active,
          startedAt,
          expiresAt,
          bookingCreditsRemaining: plan.bookingCredits,
          courseCreditsRemaining: plan.courseCredits,
          paymentIntentId: intent.id,
        },
      });

      await tx.subscriptionTransaction.create({
        data: {
          userSubscriptionId: subscription.id,
          amount: plan.price,
          paymentMethod: dto.paymentMethod,
          paymentProviderRef: intent.id,
          status: TransactionStatus.succeeded,
        },
      });

      return tx.userSubscription.findUniqueOrThrow({
        where: { id: subscription.id },
        include: { plan: true, transactions: true },
      });
    });
  }

  async listMine(userId: string) {
    await this.expireStaleSubscriptions(userId);
    return this.prisma.userSubscription.findMany({
      where: { userId },
      include: { plan: true, transactions: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancel(userId: string, id: string) {
    const subscription = await this.prisma.userSubscription.findUnique({ where: { id } });
    if (!subscription || subscription.userId !== userId) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'الاشتراك غير موجود',
        en: 'Subscription not found',
      });
    }
    if (subscription.status !== SubscriptionStatus.active) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'لا يمكن إلغاء اشتراك غير نشط',
        en: 'Cannot cancel a subscription that is not active',
      });
    }
    return this.prisma.userSubscription.update({
      where: { id },
      data: { status: SubscriptionStatus.cancelled },
    });
  }

  /** تحديث كسول: أي اشتراك نشط تجاوز تاريخ انتهائه يُصبح expired عند أول قراءة له بدل الاعتماد على مهمة مجدولة */
  private async expireStaleSubscriptions(userId: string) {
    await this.prisma.userSubscription.updateMany({
      where: { userId, status: SubscriptionStatus.active, expiresAt: { lt: new Date() } },
      data: { status: SubscriptionStatus.expired },
    });
  }
}
