"use client";

import { Download } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminUi";
import { useExportCsv, type ExportKind } from "@/lib/hooks/useAdminContent";

export function ExportCsvButton({ kind, label = "تصدير CSV" }: { kind: ExportKind; label?: string }) {
  const exportCsv = useExportCsv();
  return (
    <div className="flex flex-col items-end gap-1">
      <AdminButton className="h-9" disabled={exportCsv.isPending} onClick={() => exportCsv.mutate(kind)}>
        <Download className="size-4" />
        {exportCsv.isPending ? "جارٍ التحضير..." : label}
      </AdminButton>
      {exportCsv.error && <span className="text-xs text-red-400">{exportCsv.error.message}</span>}
    </div>
  );
}
