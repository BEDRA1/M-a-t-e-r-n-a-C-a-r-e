"use client";

import { useState } from "react";
import {
  AdminButton,
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  ConfirmDialog,
  ErrorNotice,
  FilterChips,
  StatusPill,
  TableMessageRow,
  TableSkeletonRows,
} from "@/components/admin/AdminUi";
import { useAdminSpecialists, useReviewSpecialist, type AdminSpecialist } from "@/lib/hooks/useAdmin";
import { formatArabicDate, maskPhone } from "@/lib/format";
import { TRACKS } from "@/lib/tracks";
import type { SpecialistStatus } from "@/lib/types";

const STATUS_LABELS: Record<SpecialistStatus, string> = {
  pending: "قيد المراجعة",
  approved: "معتمدة",
  rejected: "مرفوضة",
};
const STATUS_TONES = { pending: "warning", approved: "positive", rejected: "alert" } as const;

type Filter = "all" | SpecialistStatus;
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "pending", label: STATUS_LABELS.pending },
  { value: "approved", label: STATUS_LABELS.approved },
  { value: "rejected", label: STATUS_LABELS.rejected },
];

const HEAD = ["الاسم", "التخصص / المسار", "الخبرة", "الهاتف", "تاريخ التسجيل", "الحالة", "إجراءات"];

export function AdminSpecialistsContent() {
  const specialists = useAdminSpecialists();
  const review = useReviewSpecialist();
  const [filter, setFilter] = useState<Filter>("all");
  const [toReject, setToReject] = useState<AdminSpecialist | null>(null);

  const all = specialists.data ?? [];
  const rows = all.filter((s) => filter === "all" || s.status === filter);
  const pendingCount = all.filter((s) => s.status === "pending").length;
  const busyId = review.isPending ? review.variables?.id : undefined;

  const confirmReject = () => {
    if (!toReject) return;
    review.mutate({ id: toReject.id, decision: "reject" }, { onSettled: () => setToReject(null) });
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="الأخصائيات"
        description={
          specialists.data
            ? `${all.length.toLocaleString("ar-DZ")} ملف مهني — ${pendingCount.toLocaleString("ar-DZ")} قيد المراجعة`
            : "مراجعة واعتماد الملفات المهنية"
        }
      />

      {review.error && <ErrorNotice message={review.error.message} />}

      <AdminPanel>
        <div className="mb-4">
          <FilterChips options={FILTERS} value={filter} onChange={setFilter} />
        </div>
        {specialists.error ? (
          <ErrorNotice message={specialists.error.message} />
        ) : (
          <AdminTable head={HEAD}>
            {specialists.isLoading ? (
              <TableSkeletonRows cols={HEAD.length} />
            ) : rows.length === 0 ? (
              <TableMessageRow colSpan={HEAD.length}>لا توجد ملفات مطابقة</TableMessageRow>
            ) : (
              rows.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40">
                  <td className="px-3 py-3 font-semibold text-slate-100">{s.fullName}</td>
                  <td className="px-3 py-3 text-slate-300">
                    {s.specialty}
                    <span className="block text-xs text-slate-500">{TRACKS[s.track]?.name ?? s.track}</span>
                  </td>
                  <td className="px-3 py-3 tabular-nums text-slate-300">{s.yearsExperience} سنة</td>
                  <td className="px-3 py-3 font-mono tabular-nums" dir="ltr">
                    {s.user?.phone ? maskPhone(s.user.phone) : "—"}
                  </td>
                  <td className="px-3 py-3 text-slate-300">{formatArabicDate(s.createdAt)}</td>
                  <td className="px-3 py-3">
                    <StatusPill tone={STATUS_TONES[s.status]}>{STATUS_LABELS[s.status]}</StatusPill>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      {s.status !== "approved" && (
                        <AdminButton
                          tone="positive"
                          disabled={busyId === s.id}
                          onClick={() => review.mutate({ id: s.id, decision: "approve" })}
                        >
                          اعتماد
                        </AdminButton>
                      )}
                      {s.status !== "rejected" && (
                        <AdminButton tone="alert" disabled={busyId === s.id} onClick={() => setToReject(s)}>
                          رفض
                        </AdminButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </AdminTable>
        )}
      </AdminPanel>

      <ConfirmDialog
        open={toReject !== null}
        title="رفض الملف المهني؟"
        description={
          toReject
            ? `سيُخفى ملف «${toReject.fullName}» من قائمة الأخصائيات العامة ولن تستقبل حجوزات جديدة. يمكن اعتماده لاحقًا.`
            : ""
        }
        confirmLabel="تأكيد الرفض"
        loading={review.isPending}
        onConfirm={confirmReject}
        onCancel={() => setToReject(null)}
      />
    </div>
  );
}
