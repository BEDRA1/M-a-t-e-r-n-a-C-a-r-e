"use client";

import Link from "next/link";
import { ArrowLeft, ShieldAlert, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { MyCreatedCoursesSection } from "./MyCreatedCoursesSection";

export function SpecialistPanelContent() {
  const currentUser = useCurrentUser();

  if (currentUser.isLoading) {
    return <PageSpinner />;
  }

  if (currentUser.data?.role !== "specialist") {
    return (
      <Card className="flex flex-col items-center gap-2 py-10 text-center text-muted">
        <ShieldAlert className="size-8 text-primary-300" strokeWidth={1.5} />
        <p>هذه الصفحة مخصصة لحسابات الأخصائيين المعتمدين فقط.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">لوحة الأخصائي</h1>
        <p className="mt-1 text-sm text-muted">إدارة دوراتك، ومتابعة حجوزاتك ومريضاتك من مساحة العمل الكاملة.</p>
      </div>

      {/* إدارة الحجوزات والمريضات والملاحظات الكلينيكية انتقلت لمساحة عمل مخصّصة أكثر
          اكتمالًا (خصوصية بيانات، سجلات مريضات، ملاحظات كلينيكية) — تبقى هذه الصفحة
          لإدارة الدورات فقط، مع رابط واضح للمساحة الجديدة */}
      <Link
        href="/specialist"
        className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-black/5 bg-gradient-to-l from-primary-500 to-accent-500 p-5 text-white shadow-[var(--shadow-soft)] transition-transform hover:scale-[1.01]"
      >
        <span className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-white/20">
            <Stethoscope className="size-5" strokeWidth={2} />
          </span>
          <span>
            <span className="block font-bold">مساحة عمل الأخصائي الكاملة</span>
            <span className="block text-sm text-white/90">حجوزاتك، مريضاتك، والملاحظات الكلينيكية في مكان واحد</span>
          </span>
        </span>
        <ArrowLeft className="size-5 shrink-0" strokeWidth={2.5} />
      </Link>

      <div className="border-t border-black/5 pt-6">
        <MyCreatedCoursesSection />
      </div>
    </div>
  );
}
