"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Siren } from "lucide-react";
import { useUrgentOpenCount } from "@/lib/hooks/useAdmin";

/** تنبيه أحمر ثابت أعلى كل صفحات /admin ما دام هناك طلب مساعدة عاجل غير معالج */
export function UrgentHelpBanner() {
  const pathname = usePathname();
  const { data } = useUrgentOpenCount();
  const open = data?.open ?? 0;
  if (open === 0) return null;

  const onCenter = pathname === "/admin/urgent-help";

  return (
    <div className="sticky top-16 z-20 border-b border-red-500/40 bg-red-600 text-white" role="alert">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 sm:px-6 lg:px-8">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Siren className="size-5 shrink-0 animate-pulse" strokeWidth={2.25} />
          {open === 1 ? "طلب مساعدة عاجل جديد غير معالج" : `${open.toLocaleString("ar-DZ")} طلبات مساعدة عاجلة غير معالجة`}
        </p>
        {!onCenter && (
          <Link
            href="/admin/urgent-help"
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-red-700 transition-colors hover:bg-red-50"
          >
            فتح مركز الطلبات
          </Link>
        )}
      </div>
    </div>
  );
}
