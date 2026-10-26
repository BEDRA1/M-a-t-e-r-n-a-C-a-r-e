"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import {
  AdminButton,
  AdminPanel,
  AdminPanelTitle,
  AdminTable,
  ConfirmDialog,
  ErrorNotice,
  StatusPill,
  TableMessageRow,
  adminInputClass,
} from "@/components/admin/AdminUi";
import { bookingTone, subscriptionTone } from "@/components/admin/admin-tones";
import { MEAL_WORKFLOW, PRODUCT_WORKFLOW, SERVICE_WORKFLOW } from "@/components/admin/orders/order-workflow";
import {
  useAdminUserDetails,
  useChangeUserRole,
  useGrantSubscription,
  useSetUserActive,
} from "@/lib/hooks/useAdmin";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { useSubscriptionPlans } from "@/lib/hooks/useSubscriptions";
import {
  bookingStatusLabel,
  consultationTypeLabel,
  formatArabicDate,
  formatArabicDateTime,
  formatDzd,
  homeServiceDisplayName,
  subscriptionStatusLabel,
  userRoleLabel,
} from "@/lib/format";
import { TRACKS } from "@/lib/tracks";
import type { SubscriptionPaymentMethod, UserRole } from "@/lib/types";

const ROLES: UserRole[] = ["mother", "spouse", "specialist", "admin"];

const PAYMENT_METHOD_LABELS: Record<SubscriptionPaymentMethod, string> = {
  visa: "بطاقة بنكية",
  baridimob: "BaridiMob",
  manual: "يدوي (الإدارة)",
};

export function AdminUserDetailsContent({ userId }: { userId: string }) {
  const details = useAdminUserDetails(userId);
  const me = useCurrentUser();
  const setActive = useSetUserActive();
  const changeRole = useChangeUserRole();
  const grant = useGrantSubscription();
  const plans = useSubscriptionPlans();

  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [confirmActive, setConfirmActive] = useState(false);
  const [planCode, setPlanCode] = useState("");
  const [reference, setReference] = useState("");
  const [confirmGrant, setConfirmGrant] = useState(false);

  if (details.isLoading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-slate-800" />;
  }
  if (details.error || !details.data) {
    return (
      <div className="flex flex-col gap-4">
        <BackLink />
        <ErrorNotice message={details.error?.message ?? "تعذّر تحميل المستخدم"} />
      </div>
    );
  }

  const u = details.data;
  const isSelf = me.data?.id === u.id;
  const canSubscribe = u.role === "mother" || u.role === "spouse";
  const selectedPlan = plans.data?.find((p) => p.code === planCode);
  const actionError = setActive.error ?? changeRole.error ?? grant.error;

  return (
    <div className="flex flex-col gap-6">
      <BackLink />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 dir="ltr" className="font-mono text-2xl font-extrabold tabular-nums text-white sm:text-3xl">
              {u.phone}
            </h1>
            <StatusPill tone={u.isActive ? "positive" : "alert"}>{u.isActive ? "نشط" : "معطّل"}</StatusPill>
            <StatusPill tone={u.role === "admin" ? "warning" : "neutral"}>{userRoleLabel(u.role)}</StatusPill>
            {isSelf && <StatusPill tone="neutral">حسابك</StatusPill>}
          </div>
          <p className="mt-1.5 text-sm text-slate-400">
            {u.wilaya || "ولاية غير محددة"} · {u.email || "بلا بريد"} · مسجّل منذ {formatArabicDate(u.createdAt)}
          </p>
        </div>
        <a
          href={`tel:${u.phone}`}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-500"
        >
          <Phone className="size-4" />
          اتصال
        </a>
      </div>

      {actionError && <ErrorNotice message={actionError.message} />}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AdminPanel>
          <AdminPanelTitle>حالة الحساب</AdminPanelTitle>
          <p className="text-sm text-slate-400">
            {u.isActive
              ? "التعطيل يمنع الدخول فورًا ويُنهي كل جلساته. سجلاته (حجوزات، طلبات) تبقى كما هي."
              : "الحساب معطّل ولا يستطيع الدخول."}
          </p>
          <AdminButton
            className="mt-4"
            tone={u.isActive ? "alert" : "positive"}
            disabled={setActive.isPending || (isSelf && u.isActive)}
            title={isSelf ? "لا يمكنك تعطيل حسابك بنفسك" : undefined}
            onClick={() => setConfirmActive(true)}
          >
            {u.isActive ? "تعطيل الحساب" : "تفعيل الحساب"}
          </AdminButton>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelTitle>الدور</AdminPanelTitle>
          <div className="flex flex-wrap gap-1.5">
            {ROLES.map((r) => {
              // منع الأدمن من إزالة دور admin عن نفسه — يُفرض في الـBackend أيضًا
              const blocked = isSelf && r !== "admin";
              return (
                <AdminButton
                  key={r}
                  tone={u.role === r ? "positive" : "neutral"}
                  disabled={u.role === r || blocked || changeRole.isPending}
                  title={blocked ? "لا يمكنك إزالة صلاحية الإدارة عن نفسك" : undefined}
                  onClick={() => setPendingRole(r)}
                >
                  {userRoleLabel(r)}
                </AdminButton>
              );
            })}
          </div>
          {u.specialistProfile && (
            <p className="mt-3 text-xs text-slate-500">
              ملف مهني: {u.specialistProfile.fullName} · {TRACKS[u.specialistProfile.track]?.name} ·{" "}
              {u.specialistProfile.status === "approved" ? "معتمد" : u.specialistProfile.status === "pending" ? "قيد المراجعة" : "مرفوض"}
            </p>
          )}
        </AdminPanel>

        <AdminPanel>
          <AdminPanelTitle>منح اشتراك يدويًا</AdminPanelTitle>
          {canSubscribe ? (
            <div className="flex flex-col gap-2">
              <select value={planCode} onChange={(e) => setPlanCode(e.target.value)} className={`${adminInputClass} w-full`}>
                <option value="">اختر الباقة</option>
                {(plans.data ?? []).map((p) => (
                  <option key={p.id} value={p.code}>
                    {p.nameAr} — {formatDzd(p.price)}
                  </option>
                ))}
              </select>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="مرجع الدفع (رقم وصل CCP...) — اختياري"
                maxLength={100}
                className={`${adminInputClass} w-full`}
              />
              <AdminButton tone="positive" disabled={!planCode || grant.isPending} onClick={() => setConfirmGrant(true)}>
                منح الاشتراك
              </AdminButton>
            </div>
          ) : (
            <p className="text-sm text-slate-400">الاشتراكات متاحة للأمهات والأزواج فقط.</p>
          )}
        </AdminPanel>
      </div>

      <AdminPanel>
        <AdminPanelTitle>حجوزات الاستشارات ({u.bookingsMade.length})</AdminPanelTitle>
        <AdminTable head={["الأخصائية", "الموعد", "النوع", "الحالة"]}>
          {u.bookingsMade.length === 0 ? (
            <TableMessageRow colSpan={4}>لا توجد حجوزات</TableMessageRow>
          ) : (
            u.bookingsMade.map((b) => (
              <tr key={b.id}>
                <td className="px-3 py-3 font-semibold">{b.specialist.fullName}</td>
                <td className="px-3 py-3 text-slate-300">{formatArabicDateTime(b.availabilitySlot.startTime)}</td>
                <td className="px-3 py-3 text-slate-300">{consultationTypeLabel(b.consultationType)}</td>
                <td className="px-3 py-3">
                  <StatusPill tone={bookingTone(b.status)}>{bookingStatusLabel(b.status)}</StatusPill>
                </td>
              </tr>
            ))
          )}
        </AdminTable>
      </AdminPanel>

      <AdminPanel>
        <AdminPanelTitle>الاشتراكات ({u.subscriptions.length})</AdminPanelTitle>
        <AdminTable head={["الباقة", "البداية", "الانتهاء", "طريقة الدفع", "الحالة"]}>
          {u.subscriptions.length === 0 ? (
            <TableMessageRow colSpan={5}>لا توجد اشتراكات</TableMessageRow>
          ) : (
            u.subscriptions.map((s) => (
              <tr key={s.id}>
                <td className="px-3 py-3 font-semibold">
                  {s.plan.nameAr}
                  <span className="block text-xs text-emerald-400">{formatDzd(s.plan.price)}</span>
                </td>
                <td className="px-3 py-3 text-slate-300">{formatArabicDate(s.startedAt)}</td>
                <td className="px-3 py-3 text-slate-300">{s.expiresAt ? formatArabicDate(s.expiresAt) : "—"}</td>
                <td className="px-3 py-3 text-slate-300">
                  {s.transactions.map((t) => PAYMENT_METHOD_LABELS[t.paymentMethod] ?? t.paymentMethod).join("، ") || "—"}
                </td>
                <td className="px-3 py-3">
                  <StatusPill tone={subscriptionTone(s.status)}>{subscriptionStatusLabel(s.status)}</StatusPill>
                </td>
              </tr>
            ))
          )}
        </AdminTable>
      </AdminPanel>

      <AdminPanel>
        <AdminPanelTitle>
          الطلبات ({u.mealOrders.length + u.productOrders.length + u.serviceBookings.length})
        </AdminPanelTitle>
        <AdminTable head={["النوع", "التفاصيل", "التاريخ", "المبلغ", "الحالة"]}>
          {u.mealOrders.length + u.productOrders.length + u.serviceBookings.length === 0 ? (
            <TableMessageRow colSpan={5}>لا توجد طلبات</TableMessageRow>
          ) : (
            <>
              {u.mealOrders.map((o) => (
                <tr key={o.id}>
                  <td className="px-3 py-3">وجبات</td>
                  <td className="px-3 py-3 text-slate-300">توصيل {formatArabicDateTime(o.preferredTime)}</td>
                  <td className="px-3 py-3 text-slate-300">{formatArabicDate(o.createdAt)}</td>
                  <td className="px-3 py-3 tabular-nums text-emerald-400">{formatDzd(o.totalPrice)}</td>
                  <td className="px-3 py-3">
                    <StatusPill tone={MEAL_WORKFLOW.tones[o.status]}>{MEAL_WORKFLOW.labels[o.status]}</StatusPill>
                  </td>
                </tr>
              ))}
              {u.productOrders.map((o) => (
                <tr key={o.id}>
                  <td className="px-3 py-3">متجر</td>
                  <td className="px-3 py-3 text-slate-300">—</td>
                  <td className="px-3 py-3 text-slate-300">{formatArabicDate(o.createdAt)}</td>
                  <td className="px-3 py-3 tabular-nums text-emerald-400">{formatDzd(o.totalPrice)}</td>
                  <td className="px-3 py-3">
                    <StatusPill tone={PRODUCT_WORKFLOW.tones[o.status]}>{PRODUCT_WORKFLOW.labels[o.status]}</StatusPill>
                  </td>
                </tr>
              ))}
              {u.serviceBookings.map((o) => (
                <tr key={o.id}>
                  <td className="px-3 py-3">خدمة منزلية</td>
                  <td className="px-3 py-3 text-slate-300">{homeServiceDisplayName(o.service.name)}</td>
                  <td className="px-3 py-3 text-slate-300">{formatArabicDateTime(o.scheduledTime)}</td>
                  <td className="px-3 py-3 text-slate-500">—</td>
                  <td className="px-3 py-3">
                    <StatusPill tone={SERVICE_WORKFLOW.tones[o.status]}>{SERVICE_WORKFLOW.labels[o.status]}</StatusPill>
                  </td>
                </tr>
              ))}
            </>
          )}
        </AdminTable>
      </AdminPanel>

      <ConfirmDialog
        open={confirmActive}
        title={u.isActive ? "تعطيل الحساب؟" : "تفعيل الحساب؟"}
        description={
          u.isActive
            ? "لن يستطيع صاحب الحساب الدخول، وتُنهى كل جلساته فورًا على كل الأجهزة. يمكن إعادة التفعيل لاحقًا."
            : "سيتمكن صاحب الحساب من تسجيل الدخول من جديد."
        }
        confirmLabel={u.isActive ? "تأكيد التعطيل" : "تأكيد التفعيل"}
        loading={setActive.isPending}
        onConfirm={() =>
          setActive.mutate({ id: u.id, isActive: !u.isActive }, { onSettled: () => setConfirmActive(false) })
        }
        onCancel={() => setConfirmActive(false)}
      />

      <ConfirmDialog
        open={pendingRole !== null}
        title="تغيير الدور؟"
        description={
          pendingRole
            ? `سيتغيّر الدور من «${userRoleLabel(u.role)}» إلى «${userRoleLabel(pendingRole)}»، وتتغيّر صلاحياته فورًا.${
                u.role === "specialist" ? " ملفه المهني المعتمد سيُرفض تلقائيًا ويختفي من قائمة الأخصائيات." : ""
              }${pendingRole === "admin" ? " سيحصل على صلاحيات الإدارة الكاملة." : ""}`
            : ""
        }
        confirmLabel="تأكيد التغيير"
        loading={changeRole.isPending}
        onConfirm={() =>
          pendingRole && changeRole.mutate({ id: u.id, role: pendingRole }, { onSettled: () => setPendingRole(null) })
        }
        onCancel={() => setPendingRole(null)}
      />

      <ConfirmDialog
        open={confirmGrant}
        title="منح الاشتراك؟"
        description={
          selectedPlan
            ? `سيُفعَّل اشتراك «${selectedPlan.nameAr}» فورًا ويُسجَّل كدفعة يدوية بقيمة ${formatDzd(selectedPlan.price)} في الإيرادات.`
            : ""
        }
        confirmLabel="تأكيد المنح"
        loading={grant.isPending}
        onConfirm={() =>
          grant.mutate(
            { userId: u.id, planCode, reference: reference.trim() || undefined },
            {
              onSuccess: () => {
                setPlanCode("");
                setReference("");
              },
              onSettled: () => setConfirmGrant(false),
            },
          )
        }
        onCancel={() => setConfirmGrant(false)}
      />
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/admin/users" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white">
      <ArrowRight className="size-4" />
      كل المستخدمين
    </Link>
  );
}
