"use client";

import { useMemo } from "react";
import { AlertOctagon, CalendarCheck, ShoppingBag, Users, Wallet } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AdminPageHeader,
  AdminPanel,
  AdminPanelTitle,
  EndpointPendingNotice,
  StatCard,
  StatusPill,
} from "@/components/admin/AdminUi";
import {
  isMissingEndpoint,
  subscriptionAmount,
  useAdminBookings,
  useAdminSubscriptions,
  useAdminOrderCounts,
  useAdminUsers,
  useUrgentOpenCount,
} from "@/lib/hooks/useAdmin";
import { bookingStatusLabel, formatArabicDate, formatArabicDateTime, formatDzd, maskPhone, userRoleLabel } from "@/lib/format";
import { bookingTone } from "@/components/admin/admin-tones";

const CHART_DAYS = 30;

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** وقت الحجز الفعلي هو بداية الفتحة؛ تاريخ الإنشاء احتياط فقط إن لم تُرفَق الفتحة */
function bookingTime(b: { availabilitySlot?: { startTime: string }; createdAt: string }): string {
  return b.availabilitySlot?.startTime ?? b.createdAt;
}

export function AdminOverviewContent() {
  const users = useAdminUsers();
  const bookings = useAdminBookings();
  const subscriptions = useAdminSubscriptions();
  const urgent = useUrgentOpenCount();
  const orderCounts = useAdminOrderCounts();

  const now = new Date();
  const todayKey = dayKey(now);

  const todayConfirmed = (bookings.data ?? []).filter(
    (b) => b.status === "confirmed" && dayKey(new Date(bookingTime(b))) === todayKey,
  ).length;

  const monthRevenue = (subscriptions.data ?? [])
    .filter((s) => {
      const d = new Date(s.startedAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((sum, s) => sum + subscriptionAmount(s), 0);

  const openUrgent = urgent.data?.open ?? 0;

  const chartData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const u of users.data ?? []) {
      const k = dayKey(new Date(u.createdAt));
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    const fmt = new Intl.DateTimeFormat("ar-DZ", { day: "numeric", month: "short" });
    const today = new Date();
    return Array.from({ length: CHART_DAYS }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (CHART_DAYS - 1 - i));
      return { date: fmt.format(d), count: counts.get(dayKey(d)) ?? 0 };
    });
  }, [users.data]);

  const latestBookings = [...(bookings.data ?? [])]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);
  const latestUsers = [...(users.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  const unavailable = (q: { error: unknown }) => isMissingEndpoint(q.error);
  const valueOrDash = (q: { error: unknown }, value: React.ReactNode) => (q.error ? "—" : value);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="لوحة التحكم" description="نظرة عامة على نشاط المنصة" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="إجمالي المستخدمين"
          icon={Users}
          loading={users.isLoading}
          value={valueOrDash(users, (users.data?.length ?? 0).toLocaleString("ar-DZ"))}
          hint={unavailable(users) ? "بانتظار GET /users" : "كل الأدوار"}
        />
        <StatCard
          label="حجوزات اليوم المؤكدة"
          icon={CalendarCheck}
          tone="positive"
          loading={bookings.isLoading}
          value={valueOrDash(bookings, todayConfirmed.toLocaleString("ar-DZ"))}
          hint={unavailable(bookings) ? "بانتظار GET /bookings" : formatArabicDate(now.toISOString())}
        />
        <StatCard
          label="إيرادات هذا الشهر"
          icon={Wallet}
          tone="positive"
          loading={subscriptions.isLoading}
          value={valueOrDash(subscriptions, formatDzd(monthRevenue))}
          hint={unavailable(subscriptions) ? "بانتظار GET /subscriptions" : "من الاشتراكات"}
        />
        <StatCard
          label="طلبات مساعدة عاجلة مفتوحة"
          icon={AlertOctagon}
          tone={openUrgent > 0 ? "alert" : "neutral"}
          loading={urgent.isLoading}
          value={valueOrDash(urgent, openUrgent.toLocaleString("ar-DZ"))}
          hint="غير معالجة بعد"
        />
        <StatCard
          label="طلبات جديدة تنتظر"
          icon={ShoppingBag}
          tone={(orderCounts.data?.total ?? 0) > 0 ? "warning" : "neutral"}
          loading={orderCounts.isLoading}
          value={valueOrDash(orderCounts, (orderCounts.data?.total ?? 0).toLocaleString("ar-DZ"))}
          hint={
            orderCounts.data
              ? `وجبات ${orderCounts.data.mealOrders} · متجر ${orderCounts.data.productOrders} · خدمات ${orderCounts.data.serviceBookings}`
              : undefined
          }
        />
      </div>

      <AdminPanel>
        <AdminPanelTitle>مستخدمون جدد — آخر {CHART_DAYS} يومًا</AdminPanelTitle>
        {unavailable(users) && (
          <div className="mb-4">
            <EndpointPendingNotice endpoint="GET /users" />
          </div>
        )}
        <div className="h-72" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#94A3B8", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#334155" }} interval={4} />
              <YAxis allowDecimals={false} tick={{ fill: "#94A3B8", fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "#0F172A", border: "1px solid #334155", borderRadius: 12, color: "#F1F5F9" }}
                labelStyle={{ color: "#CBD5E1" }}
                formatter={(value) => [value, "مستخدمون جدد"]}
              />
              <Line type="monotone" dataKey="count" stroke="#34D399" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </AdminPanel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AdminPanel>
          <AdminPanelTitle>آخر 5 حجوزات</AdminPanelTitle>
          {unavailable(bookings) ? (
            <EndpointPendingNotice endpoint="GET /bookings" />
          ) : (
            <RecentList
              loading={bookings.isLoading}
              empty="لا توجد حجوزات بعد"
              items={latestBookings.map((b) => ({
                id: b.id,
                primary: b.specialist?.fullName ?? "—",
                secondary: `${b.user ? maskPhone(b.user.phone) : "—"} · ${formatArabicDateTime(bookingTime(b))}`,
                badge: <StatusPill tone={bookingTone(b.status)}>{bookingStatusLabel(b.status)}</StatusPill>,
              }))}
            />
          )}
        </AdminPanel>

        <AdminPanel>
          <AdminPanelTitle>آخر 5 مستخدمين مسجلين</AdminPanelTitle>
          {unavailable(users) ? (
            <EndpointPendingNotice endpoint="GET /users" />
          ) : (
            <RecentList
              loading={users.isLoading}
              empty="لا يوجد مستخدمون بعد"
              items={latestUsers.map((u) => ({
                id: u.id,
                primary: maskPhone(u.phone),
                secondary: `${u.wilaya ?? "—"} · ${formatArabicDate(u.createdAt)}`,
                badge: <StatusPill tone="neutral">{userRoleLabel(u.role)}</StatusPill>,
              }))}
            />
          )}
        </AdminPanel>
      </div>
    </div>
  );
}

function RecentList({
  loading,
  empty,
  items,
}: {
  loading: boolean;
  empty: string;
  items: { id: string; primary: string; secondary: string; badge: React.ReactNode }[];
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-11 animate-pulse rounded-lg bg-slate-700/60" />
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-500">{empty}</p>;
  }
  return (
    <ul className="divide-y divide-slate-700/60">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-100">{item.primary}</p>
            <p className="truncate text-xs text-slate-400">{item.secondary}</p>
          </div>
          {item.badge}
        </li>
      ))}
    </ul>
  );
}
