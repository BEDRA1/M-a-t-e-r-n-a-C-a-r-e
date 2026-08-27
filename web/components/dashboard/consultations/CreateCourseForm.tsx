"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useCreateCourse } from "@/lib/hooks/useCourses";
import { ApiError } from "@/lib/api-client";
import { createCourseSchema, type CreateCourseFormValues } from "@/lib/validation/course";

export function CreateCourseForm({ onDone }: { onDone: () => void }) {
  const createCourse = useCreateCourse();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateCourseFormValues>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: { type: "remote" },
  });

  const type = watch("type");

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await createCourse.mutateAsync({
        title: values.title,
        description: values.description,
        type: values.type,
        capacity: values.capacity ? Number(values.capacity) : undefined,
        startDate: new Date(values.startDate).toISOString(),
        durationText: values.durationText,
        durationDays: Number(values.durationDays),
        price: Number(values.price),
        contentUrl: values.contentUrl || undefined,
        wilaya: values.wilaya || undefined,
      });
      onDone();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "تعذّر إنشاء الدورة");
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {serverError && <Alert tone="error">{serverError}</Alert>}

      <Input label="عنوان الدورة" placeholder="مثال: دورة التحضير للولادة" error={errors.title?.message} {...register("title")} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">وصف الدورة</label>
        <textarea
          rows={4}
          className="w-full rounded-xl border border-black/10 bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
          placeholder="وصف شامل لمحتوى الدورة وأهدافها"
          {...register("description")}
        />
        {errors.description?.message && <p className="text-xs text-red-600">{errors.description.message}</p>}
      </div>

      <Select label="نوع الدورة" error={errors.type?.message} {...register("type")}>
        <option value="remote">عن بُعد</option>
        <option value="in_person">حضوري</option>
      </Select>

      {type === "in_person" && (
        <>
          <Input label="السعة (عدد المقاعد)" type="number" placeholder="20" error={errors.capacity?.message} {...register("capacity")} />
          <Input label="الولاية" placeholder="الجزائر العاصمة" error={errors.wilaya?.message} {...register("wilaya")} />
        </>
      )}

      {type === "remote" && (
        <Input
          label="رابط المحتوى"
          placeholder="https://example.com/course-content"
          error={errors.contentUrl?.message}
          {...register("contentUrl")}
        />
      )}

      <Input label="تاريخ بدء الدورة" type="datetime-local" error={errors.startDate?.message} {...register("startDate")} />

      <div className="grid grid-cols-2 gap-3">
        <Input label="المدة (نص للعرض)" placeholder="3 أسابيع" error={errors.durationText?.message} {...register("durationText")} />
        <Input label="المدة بالأيام" type="number" placeholder="21" error={errors.durationDays?.message} {...register("durationDays")} />
      </div>

      <Input label="السعر (دج)" type="number" placeholder="8000" error={errors.price?.message} {...register("price")} />

      <div className="flex gap-2">
        <Button type="submit" loading={createCourse.isPending}>
          إنشاء الدورة
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}
