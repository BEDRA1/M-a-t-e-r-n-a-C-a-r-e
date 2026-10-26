import { Injectable } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { maskPhone } from '../common/lib/mask-phone';
import { Cell, excelText, formatDate, toCsv } from './csv';

export const EXPORT_KINDS = ['users', 'bookings', 'subscriptions', 'orders'] as const;
export type ExportKind = (typeof EXPORT_KINDS)[number];

const ROLE: Record<string, string> = { mother: 'أم', spouse: 'زوج', specialist: 'أخصائية', admin: 'إدارة' };
const CONSULTATION: Record<string, string> = { in_person: 'حضوري', remote: 'عن بُعد' };
const STATUS: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغى',
  out_for_delivery: 'في الطريق',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  active: 'نشط',
  expired: 'منتهٍ',
};
const PAYMENT_STATUS: Record<string, string> = {
  pending: 'غير مدفوع',
  paid: 'مدفوع',
  failed: 'فشل',
  free_with_subscription: 'ضمن الاشتراك',
};
const PAYMENT_METHOD: Record<string, string> = {
  card: 'بطاقة',
  ccp: 'CCP',
  baridimob: 'BaridiMob',
  pay_at_attendance: 'عند الحضور',
  visa: 'بطاقة بنكية',
  manual: 'يدوي (الإدارة)',
};

const label = (map: Record<string, string>, v: string | null | undefined) => (v ? (map[v] ?? v) : '');

// لا تُصدَّر أي بيانات طبية (تقييمات، مزاج، ملاحظات كلينيكية، إجابات استبيان الحجز) ولا مراجع دفع.
// الهاتف مقتطع في كل التصديرات ما عدا الطلبات: التوصيل يحتاج الرقم كاملًا مع العنوان
@Injectable()
export class AdminExportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async export(adminUserId: string, kind: ExportKind) {
    const date = formatDate(new Date()).slice(0, 10);
    const { head, rows } = await this.build(kind);
    await this.auditLog.record({
      adminUserId,
      action: 'export_csv',
      entityType: 'export',
      details: { kind, rows: rows.length },
    });
    return { filename: `materna-${kind}-${date}.csv`, rows: rows.length, content: toCsv(head, rows) };
  }

  private build(kind: ExportKind): Promise<{ head: string[]; rows: Cell[][] }> {
    switch (kind) {
      case 'users':
        return this.users();
      case 'bookings':
        return this.bookings();
      case 'subscriptions':
        return this.subscriptions();
      case 'orders':
        return this.orders();
    }
  }

  private async users() {
    const users = await this.prisma.user.findMany({
      select: { phone: true, role: true, wilaya: true, isActive: true, createdAt: true, _count: { select: { bookingsMade: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return {
      head: ['الهاتف', 'الدور', 'الحالة', 'الولاية', 'تاريخ التسجيل', 'عدد الحجوزات'],
      rows: users.map((u) => [
        maskPhone(u.phone),
        label(ROLE, u.role),
        u.isActive ? 'نشط' : 'معطّل',
        u.wilaya,
        formatDate(u.createdAt),
        u._count.bookingsMade,
      ]),
    };
  }

  private async bookings() {
    const bookings = await this.prisma.booking.findMany({
      select: {
        consultationType: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        price: true,
        createdAt: true,
        user: { select: { phone: true } },
        specialist: { select: { fullName: true } },
        availabilitySlot: { select: { startTime: true } },
        reason: { select: { reasonText: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return {
      head: ['الموعد', 'هاتف الأم', 'الأخصائية', 'السبب', 'النوع', 'الحالة', 'الدفع', 'طريقة الدفع', 'السعر (دج)', 'تاريخ الحجز'],
      rows: bookings.map((b) => [
        formatDate(b.availabilitySlot.startTime),
        maskPhone(b.user.phone),
        b.specialist.fullName,
        b.reason.reasonText,
        label(CONSULTATION, b.consultationType),
        label(STATUS, b.status),
        label(PAYMENT_STATUS, b.paymentStatus),
        label(PAYMENT_METHOD, b.paymentMethod),
        b.price,
        formatDate(b.createdAt),
      ]),
    };
  }

  private async subscriptions() {
    const subs = await this.prisma.userSubscription.findMany({
      select: {
        status: true,
        startedAt: true,
        expiresAt: true,
        bookingCreditsRemaining: true,
        courseCreditsRemaining: true,
        user: { select: { phone: true } },
        plan: { select: { nameAr: true } },
        transactions: { where: { status: TransactionStatus.succeeded }, select: { amount: true, paymentMethod: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
    return {
      head: ['الهاتف', 'الباقة', 'الحالة', 'البداية', 'الانتهاء', 'المبلغ المدفوع (دج)', 'طريقة الدفع', 'رصيد الاستشارات', 'رصيد الدورات'],
      rows: subs.map((s) => [
        maskPhone(s.user.phone),
        s.plan.nameAr,
        label(STATUS, s.status),
        formatDate(s.startedAt),
        formatDate(s.expiresAt),
        s.transactions.reduce((sum, t) => sum + t.amount, 0),
        [...new Set(s.transactions.map((t) => label(PAYMENT_METHOD, t.paymentMethod)))].join('، '),
        s.bookingCreditsRemaining,
        s.courseCreditsRemaining,
      ]),
    };
  }

  private async orders() {
    const [meals, products, services] = await Promise.all([
      this.prisma.mealOrder.findMany({
        include: { user: { select: { phone: true } }, items: { include: { meal: { select: { name: true } } } } },
      }),
      this.prisma.productOrder.findMany({
        include: { user: { select: { phone: true } }, items: { include: { product: { select: { name: true } } } } },
      }),
      // notes مستبعدة: نص حر قد تكتب فيه الأم معلومات صحية لا يحتاجها التوصيل
      this.prisma.serviceBooking.findMany({
        select: {
          id: true,
          address: true,
          scheduledTime: true,
          status: true,
          createdAt: true,
          user: { select: { phone: true } },
          service: { select: { name: true, basePrice: true } },
        },
      }),
    ]);

    type Row = { createdAt: Date; cells: Cell[] };
    const ref = (id: string) => id.slice(0, 8).toUpperCase();
    const all: Row[] = [
      ...meals.map((o) => ({
        createdAt: o.createdAt,
        cells: [
          'وجبات',
          ref(o.id),
          excelText(o.user.phone),
          o.deliveryAddress,
          o.items.map((i) => `${i.meal.name} ×${i.quantity}`).join(' | '),
          formatDate(o.preferredTime),
          o.totalPrice,
          label(STATUS, o.status),
          formatDate(o.createdAt),
        ],
      })),
      ...products.map((o) => ({
        createdAt: o.createdAt,
        cells: [
          'متجر',
          ref(o.id),
          excelText(o.user.phone),
          o.deliveryAddress,
          o.items.map((i) => `${i.product.name} ×${i.quantity}`).join(' | '),
          '',
          o.totalPrice,
          label(STATUS, o.status),
          formatDate(o.createdAt),
        ],
      })),
      ...services.map((o) => ({
        createdAt: o.createdAt,
        cells: [
          'خدمة منزلية',
          ref(o.id),
          excelText(o.user.phone),
          o.address,
          o.service.name,
          formatDate(o.scheduledTime),
          o.service.basePrice,
          label(STATUS, o.status),
          formatDate(o.createdAt),
        ],
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      head: ['النوع', 'رقم الطلب', 'الهاتف', 'العنوان', 'التفاصيل', 'موعد التوصيل/الخدمة', 'المبلغ (دج)', 'الحالة', 'تاريخ الطلب'],
      rows: all.map((r) => r.cells),
    };
  }
}
