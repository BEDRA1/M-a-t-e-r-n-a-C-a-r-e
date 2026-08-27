"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useCreateCheckup, useUpdateCheckup } from "@/lib/hooks/useBabies";
import { ApiError } from "@/lib/api-client";
import { checkupSchema, type CheckupFormValues } from "@/lib/validation/checkup";
import type { BabyCheckup } from "@/lib/types";

function toDateTimeInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CheckupForm({
  babyId,
  checkup,
  onDone,
}: {
  babyId: string;
  checkup?: BabyCheckup;
  onDone: () => void;
}) {
  const createCheckup = useCreateCheckup(babyId);
  const updateCheckup = useUpdateCheckup(babyId);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reminderCreated, setReminderCreated] = useState(false);
  const isEdit = Boolean(checkup);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckupFormValues>({
    resolver: zodResolver(checkupSchema),
    defaultValues: checkup
      ? { title: checkup.title, scheduledDate: toDateTimeInputValue(checkup.scheduledDate), notes: checkup.notes ?? "" }
      : { title: "", scheduledDate: "", notes: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      if (isEdit && checkup) {
        await updateCheckup.mutateAsync({
          id: checkup.id,
          title: values.title,
          scheduledDate: new Date(values.scheduledDate).toISOString(),
          notes: values.notes || undefined,
        });
        onDone();
      } else {
        const result = await createCheckup.mutateAsync({
          title: values.title,
          scheduledDate: new Date(values.scheduledDate).toISOString(),
          notes: values.notes || undefined,
        });
        if (result.linkedReminderId) {
          setReminderCreated(true);
          setTimeout(onDone, 1800);
        } else {
          onDone();
        }
      }
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "تعذّر حفظ الفحص");
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {serverError && <Alert tone="error">{serverError}</Alert>}
      {reminderCreated && (
        <Alert tone="success">تمت إضافة الفحص، وأُنشئ تذكير تلقائي بموعده.</Alert>
      )}

      <Input
        label="نوع الفحص"
        placeholder="مثال: فحص الشهر الأول، تطعيم..."
        error={errors.title?.message}
        {...register("title")}
      />

      <Input
        label="الموعد"
        type="datetime-local"
        error={errors.scheduledDate?.message}
        {...register("scheduledDate")}
      />

      <Input
        label="ملاحظات (اختياري)"
        placeholder="مثال: فحص دوري شامل مع الطبيب"
        error={errors.notes?.message}
        {...register("notes")}
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="submit"
          loading={createCheckup.isPending || updateCheckup.isPending}
          className="w-full sm:w-auto"
        >
          {isEdit ? "حفظ التعديلات" : "إضافة الفحص"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone} className="w-full sm:w-auto">
          إلغاء
        </Button>
      </div>
    </form>
  );
}
