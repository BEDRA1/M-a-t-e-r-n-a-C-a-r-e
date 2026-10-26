import { Calendar, CreditCard, ShoppingBag, Users, type LucideIcon } from "lucide-react";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminUi";
import { ExportCsvButton } from "@/components/admin/ExportCsvButton";
import type { ExportKind } from "@/lib/hooks/useAdminContent";

const REPORTS: { kind: ExportKind; title: string; icon: LucideIcon; columns: string; phone: string }[] = [
  {
    kind: "users",
    title: "المستخدمون",
    icon: Users,
    columns: "الهاتف، الدور، الحالة، الولاية، تاريخ التسجيل، عدد الحجوزات",
    phone: "الهاتف مقتطع",
  },
  {
    kind: "bookings",
    title: "حجوزات الاستشارات",
    icon: Calendar,
    columns: "الموعد، الأم، الأخصائية، السبب، النوع، الحالة، الدفع، السعر",
    phone: "الهاتف مقتطع — بلا إجابات الاستبيان",
  },
  {
    kind: "subscriptions",
    title: "الاشتراكات",
    icon: CreditCard,
    columns: "الهاتف، الباقة، الحالة، البداية، الانتهاء، المبلغ المدفوع، طريقة الدفع، الأرصدة",
    phone: "الهاتف مقتطع — بلا مراجع الدفع",
  },
  {
    kind: "orders",
    title: "الطلبات (وجبات، متجر، خدمات منزلية)",
    icon: ShoppingBag,
    columns: "النوع، رقم الطلب، الهاتف، العنوان، التفاصيل، الموعد، المبلغ، الحالة",
    phone: "الهاتف كامل — للتوصيل",
  },
];

export function AdminReportsContent() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="التقارير"
        description="ملفات CSV تُفتح مباشرة في Excel بالعربية (UTF-8، فاصل ;). كل تصدير يُسجَّل في سجل النشاط"
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {REPORTS.map((r) => (
          <AdminPanel key={r.kind} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-slate-700/60 text-slate-200">
                <r.icon className="size-5" />
              </span>
              <h2 className="font-bold text-slate-100">{r.title}</h2>
            </div>
            <p className="text-sm text-slate-400">{r.columns}</p>
            <p className={`text-xs font-semibold ${r.kind === "orders" ? "text-amber-300" : "text-slate-500"}`}>{r.phone}</p>
            <div className="mt-auto flex justify-end">
              <ExportCsvButton kind={r.kind} />
            </div>
          </AdminPanel>
        ))}
      </div>
    </div>
  );
}
