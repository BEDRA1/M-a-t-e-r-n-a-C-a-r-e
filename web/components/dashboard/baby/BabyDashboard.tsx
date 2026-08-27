"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/lib/cn";
import { useBaby } from "@/lib/hooks/useBabies";
import { ApiError } from "@/lib/api-client";
import { AddBabyForm } from "./AddBabyForm";
import { BabyInfoCard } from "./BabyInfoCard";
import { CheckupsList } from "./CheckupsList";
import type { Baby } from "@/lib/types";

export function BabyDashboard({ babies }: { babies: Baby[] }) {
  const [activeBabyId, setActiveBabyId] = useState<string | undefined>(babies[0]?.id);
  const [showAddForm, setShowAddForm] = useState(false);
  const activeBaby = useBaby(activeBabyId);

  useEffect(() => {
    if (activeBabyId && !babies.some((b) => b.id === activeBabyId)) {
      setActiveBabyId(babies[0]?.id);
    }
    if (!activeBabyId && babies.length > 0) {
      setActiveBabyId(babies[0].id);
    }
  }, [babies, activeBabyId]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">طفلي</h1>
        <Button size="sm" variant="outline" onClick={() => setShowAddForm((v) => !v)}>
          <Plus className="size-4" strokeWidth={2} />
          {showAddForm ? "إغلاق" : "إضافة طفل آخر"}
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <AddBabyForm
            onCreated={(id) => {
              setActiveBabyId(id);
              setShowAddForm(false);
            }}
          />
        </Card>
      )}

      {babies.length > 1 && (
        <div className="flex gap-2 overflow-x-auto border-b border-black/5 pb-px">
          {babies.map((baby) => (
            <button
              key={baby.id}
              type="button"
              onClick={() => setActiveBabyId(baby.id)}
              className={cn(
                "shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
                activeBabyId === baby.id
                  ? "border-primary-500 text-primary-700"
                  : "border-transparent text-foreground/60 hover:text-foreground",
              )}
            >
              {baby.fullName}
            </button>
          ))}
        </div>
      )}

      {activeBaby.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : activeBaby.isError ? (
        <Alert tone="error">
          {activeBaby.error instanceof ApiError ? activeBaby.error.message : "تعذّر تحميل بيانات الطفل"}
        </Alert>
      ) : activeBaby.data ? (
        (() => {
          const baby = activeBaby.data;
          return (
            <>
              <BabyInfoCard
                baby={baby}
                onDeleted={() => setActiveBabyId(babies.find((b) => b.id !== baby.id)?.id)}
              />
              <CheckupsList babyId={baby.id} checkups={baby.checkups ?? []} isLoading={false} />
            </>
          );
        })()
      ) : null}
    </div>
  );
}
