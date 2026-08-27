"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useAddWeeklyLog } from "@/lib/hooks/usePregnancy";
import { ApiError } from "@/lib/api-client";
import { weeklyLogSchema, type WeeklyLogFormValues } from "@/lib/validation/weekly-log";

export function WeeklyLogForm({
  defaultWeekNumber,
  onAdded,
}: {
  defaultWeekNumber: number;
  onAdded?: () => void;
}) {
  const addLog = useAddWeeklyLog();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WeeklyLogFormValues>({
    resolver: zodResolver(weeklyLogSchema),
    defaultValues: { weekNumber: String(defaultWeekNumber) },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await addLog.mutateAsync({
        weekNumber: Number(values.weekNumber),
        weightKg: values.weightKg ? Number(values.weightKg) : undefined,
        symptoms: values.symptoms
          ? values.symptoms
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        notes: values.notes || undefined,
      });
      reset({ weekNumber: String(defaultWeekNumber), weightKg: "", symptoms: "", notes: "" });
      onAdded?.();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "تعذّرت إضافة السجل");
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {serverError && <Alert tone="error">{serverError}</Alert>}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="رقم الأسبوع"
          type="number"
          min={1}
          max={42}
          error={errors.weekNumber?.message}
          {...register("weekNumber")}
        />
        <Input
          label="الوزن (كغ)"
          type="number"
          step="0.1"
          placeholder="65.5"
          error={errors.weightKg?.message}
          {...register("weightKg")}
        />
      </div>

      <Input
        label="الأعراض (افصلي بينها بفاصلة)"
        placeholder="غثيان، تعب"
        error={errors.symptoms?.message}
        {...register("symptoms")}
      />

      <Input
        label="ملاحظات (اختياري)"
        placeholder="أي ملاحظة تودّين تسجيلها"
        error={errors.notes?.message}
        {...register("notes")}
      />

      <Button type="submit" loading={addLog.isPending}>
        إضافة السجل
      </Button>
    </form>
  );
}
