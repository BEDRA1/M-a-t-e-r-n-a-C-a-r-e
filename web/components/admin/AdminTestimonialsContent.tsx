"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { AdminButton, AdminPageHeader, AdminPanel, ErrorNotice } from "@/components/admin/AdminUi";
import { useAdminTestimonials, useReviewTestimonial } from "@/lib/hooks/useAdmin";
import { formatArabicDate } from "@/lib/format";
import type { AdminTestimonial, TestimonialReviewStatus } from "@/lib/types";

const TABS: { value: TestimonialReviewStatus; label: string }[] = [
  { value: "pending", label: "قيد المراجعة" },
  { value: "approved", label: "معتمدة" },
  { value: "rejected", label: "مرفوضة" },
];

/** احتياط إن لم يُرجع الـBackend الحقل status (نسخة أقدم): بلا reviewedAt لا يمكن تمييز المرفوض */
function statusOf(t: AdminTestimonial): TestimonialReviewStatus {
  return t.status ?? (t.isApproved ? "approved" : t.reviewedAt ? "rejected" : "pending");
}

export function AdminTestimonialsContent() {
  const testimonials = useAdminTestimonials();
  const review = useReviewTestimonial();
  const [tab, setTab] = useState<TestimonialReviewStatus>("pending");

  const all = testimonials.data ?? [];
  const counts = { pending: 0, approved: 0, rejected: 0 };
  for (const t of all) counts[statusOf(t)]++;
  const rows = all.filter((t) => statusOf(t) === tab);
  const busyId = review.isPending ? review.variables?.id : undefined;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="آراء المستخدمات" description="الآراء المعتمدة فقط تظهر للعموم في الصفحة الرئيسية" />

      {review.error && <ErrorNotice message={review.error.message} />}

      <div className="flex gap-1 rounded-xl border border-slate-700/60 bg-[#1E293B] p-1" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              tab === t.value ? "bg-slate-100 text-slate-900" : "text-slate-300 hover:bg-slate-700/50",
            )}
          >
            {t.label}
            {testimonials.data && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  tab === t.value ? "bg-slate-900/10" : "bg-slate-700",
                )}
              >
                {counts[t.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {testimonials.error ? (
        <ErrorNotice message={testimonials.error.message} />
      ) : testimonials.isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-800" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <AdminPanel>
          <p className="py-8 text-center text-sm text-slate-400">لا توجد آراء في هذا التبويب</p>
        </AdminPanel>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {rows.map((t) => {
            const status = statusOf(t);
            return (
              <AdminPanel key={t.id} className="flex flex-col">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-slate-100">{t.displayName || "أم"}</p>
                  <span className="flex gap-0.5" aria-label={`التقييم ${t.rating} من 5`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn("size-4", i < t.rating ? "fill-amber-400 text-amber-400" : "text-slate-600")}
                      />
                    ))}
                  </span>
                </div>
                <p className="mt-3 flex-1 whitespace-pre-line text-sm leading-relaxed text-slate-300">{t.content}</p>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-700/60 pt-3">
                  <span className="text-xs text-slate-500">{formatArabicDate(t.createdAt)}</span>
                  <div className="flex gap-2">
                    {status !== "approved" && (
                      <AdminButton
                        tone="positive"
                        disabled={busyId === t.id}
                        onClick={() => review.mutate({ id: t.id, decision: "approve" })}
                      >
                        اعتماد
                      </AdminButton>
                    )}
                    {status !== "rejected" && (
                      <AdminButton
                        tone="alert"
                        disabled={busyId === t.id}
                        onClick={() => review.mutate({ id: t.id, decision: "reject" })}
                      >
                        رفض
                      </AdminButton>
                    )}
                  </div>
                </div>
              </AdminPanel>
            );
          })}
        </div>
      )}
    </div>
  );
}
