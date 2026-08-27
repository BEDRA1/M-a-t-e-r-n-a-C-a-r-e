"use client";

import { useState } from "react";
import { Baby as BabyIcon, Pencil, Ruler, Trash2, Weight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { babyGenderLabel, formatArabicDate, formatBabyAge } from "@/lib/format";
import { useDeleteBaby } from "@/lib/hooks/useBabies";
import { EditBabyForm } from "./EditBabyForm";
import type { Baby } from "@/lib/types";

export function BabyInfoCard({ baby, onDeleted }: { baby: Baby; onDeleted: () => void }) {
  const [editing, setEditing] = useState(false);
  const deleteBaby = useDeleteBaby();

  if (editing) {
    return (
      <Card>
        <EditBabyForm baby={baby} onDone={() => setEditing(false)} />
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <BabyIcon className="size-7" strokeWidth={2} />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-foreground">{baby.fullName}</h2>
            <p className="mt-1 text-sm text-muted">
              {formatBabyAge(baby.birthDate)} · {babyGenderLabel(baby.gender)}
            </p>
            <p className="mt-0.5 text-xs text-muted">وُلد في {formatArabicDate(baby.birthDate)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="size-4" strokeWidth={2} />
            تعديل
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => deleteBaby.mutate(baby.id, { onSuccess: onDeleted })}
            loading={deleteBaby.isPending}
          >
            <Trash2 className="size-4" strokeWidth={2} />
            حذف
          </Button>
        </div>
      </div>

      {(baby.weightGrams || baby.heightCm) && (
        <div className="mt-4 flex flex-wrap gap-4 border-t border-black/5 pt-4 text-sm text-muted">
          {baby.weightGrams && (
            <span className="flex items-center gap-1.5">
              <Weight className="size-4" strokeWidth={2} />
              {baby.weightGrams} غرام عند الولادة
            </span>
          )}
          {baby.heightCm && (
            <span className="flex items-center gap-1.5">
              <Ruler className="size-4" strokeWidth={2} />
              {baby.heightCm} سم عند الولادة
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
