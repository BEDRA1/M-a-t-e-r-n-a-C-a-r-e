"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useCreateReminder } from "@/lib/hooks/useReminders";
import { ApiError } from "@/lib/api-client";
import { reminderSchema, type ReminderFormValues } from "@/lib/validation/reminder";

export function ReminderForm() {
  const createReminder = useCreateReminder();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: { type: "vitamin" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await createReminder.mutateAsync({
        type: values.type,
        title: values.title,
        scheduledTime: new Date(values.scheduledTime).toISOString(),
        recurrence: values.recurrence || undefined,
      });
      reset({ type: values.type, title: "", scheduledTime: "", recurrence: "" });
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "تعذّرت إضافة التذكير");
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {serverError && <Alert tone="error">{serverError}</Alert>}

      <Select label="نوع التذكير" error={errors.type?.message} {...register("type")}>
        <option value="vitamin">فيتامينات</option>
        <option value="medication">دواء</option>
        <option value="water">شرب الماء</option>
        <option value="appointment">موعد طبي</option>
        <option value="other">أخرى</option>
      </Select>

      <Input
        label="العنوان"
        placeholder="مثال: حمض الفوليك"
        error={errors.title?.message}
        {...register("title")}
      />

      <Input
        label="الموعد"
        type="datetime-local"
        error={errors.scheduledTime?.message}
        {...register("scheduledTime")}
      />

      <Input
        label="التكرار (اختياري)"
        placeholder="مثال: daily"
        error={errors.recurrence?.message}
        {...register("recurrence")}
      />

      <Button type="submit" loading={createReminder.isPending}>
        إضافة التذكير
      </Button>
    </form>
  );
}
