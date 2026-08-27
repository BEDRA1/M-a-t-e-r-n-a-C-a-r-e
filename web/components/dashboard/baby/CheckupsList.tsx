"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Link2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  checkupStatusBadgeTone,
  checkupStatusLabel,
  formatArabicDateTime,
  getCheckupStatus,
} from "@/lib/format";
import { useDeleteCheckup, useUpdateCheckup } from "@/lib/hooks/useBabies";
import { CheckupForm } from "./CheckupForm";
import type { BabyCheckup } from "@/lib/types";

export function CheckupsList({
  babyId,
  checkups,
  isLoading,
}: {
  babyId: string;
  checkups: BabyCheckup[];
  isLoading: boolean;
}) {
  const [panel, setPanel] = useState<"none" | "create" | string>("none");
  const deleteCheckup = useDeleteCheckup(babyId);
  const updateCheckup = useUpdateCheckup(babyId);

  const sorted = [...checkups].sort(
    (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime(),
  );

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">الفحوصات</h2>
        {panel === "none" && (
          <Button size="sm" variant="outline" onClick={() => setPanel("create")}>
            <Plus className="size-4" strokeWidth={2} />
            إضافة فحص
          </Button>
        )}
      </div>

      {panel === "create" && (
        <div className="mt-4 rounded-2xl border border-primary-100 bg-primary-50/40 p-4">
          <CheckupForm babyId={babyId} onDone={() => setPanel("none")} />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {isLoading ? (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        ) : sorted.length === 0 && panel !== "create" ? (
          <p className="py-6 text-center text-sm text-muted">لا توجد فحوصات مسجّلة بعد.</p>
        ) : (
          sorted.map((checkup) => {
            const status = getCheckupStatus(checkup);
            const isEditing = panel === checkup.id;

            if (isEditing) {
              return (
                <div key={checkup.id} className="rounded-2xl border border-primary-100 bg-primary-50/40 p-4">
                  <CheckupForm babyId={babyId} checkup={checkup} onDone={() => setPanel("none")} />
                </div>
              );
            }

            return (
              <div
                key={checkup.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-black/5 p-4"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={checkup.completed}
                    onChange={(e) =>
                      updateCheckup.mutate({ id: checkup.id, completed: e.target.checked })
                    }
                    className="mt-1 size-5 accent-primary-500"
                    aria-label="تعليم كمكتمل"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{checkup.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span>{formatArabicDateTime(checkup.scheduledDate)}</span>
                      {checkup.linkedReminderId && (
                        <span className="flex items-center gap-1 text-primary-600">
                          <Link2 className="size-3.5" strokeWidth={2} />
                          مرتبط بتذكير
                        </span>
                      )}
                    </div>
                    {checkup.notes && (
                      <p className="mt-1.5 text-sm text-muted">{checkup.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone={checkupStatusBadgeTone(status)}>{checkupStatusLabel(status)}</Badge>
                  <button
                    type="button"
                    onClick={() => setPanel(checkup.id)}
                    className="flex size-8 items-center justify-center rounded-lg text-foreground/60 hover:bg-black/5"
                    aria-label="تعديل الفحص"
                  >
                    <Pencil className="size-4" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCheckup.mutate(checkup.id)}
                    disabled={deleteCheckup.isPending && deleteCheckup.variables === checkup.id}
                    className="flex size-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
                    aria-label="حذف الفحص"
                  >
                    <Trash2 className="size-4" strokeWidth={2} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
