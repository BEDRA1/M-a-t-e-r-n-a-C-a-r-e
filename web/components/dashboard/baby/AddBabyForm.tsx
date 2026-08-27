"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useCreateBaby } from "@/lib/hooks/useBabies";
import { ApiError } from "@/lib/api-client";
import { babySchema, type BabyFormValues } from "@/lib/validation/baby";

export function AddBabyForm({ onCreated }: { onCreated?: (babyId: string) => void }) {
  const createBaby = useCreateBaby();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BabyFormValues>({
    resolver: zodResolver(babySchema),
    defaultValues: { gender: "female" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const baby = await createBaby.mutateAsync({
        fullName: values.fullName,
        birthDate: new Date(values.birthDate).toISOString(),
        gender: values.gender,
        weightGrams: values.weightGrams ? Number(values.weightGrams) : undefined,
        heightCm: values.heightCm ? Number(values.heightCm) : undefined,
      });
      reset({ fullName: "", birthDate: "", gender: "female", weightGrams: "", heightCm: "" });
      onCreated?.(baby.id);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "تعذّرت إضافة الطفل");
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {serverError && <Alert tone="error">{serverError}</Alert>}

      <Input label="اسم الطفل" placeholder="مثال: ياسين" error={errors.fullName?.message} {...register("fullName")} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="تاريخ الميلاد"
          type="date"
          error={errors.birthDate?.message}
          {...register("birthDate")}
        />
        <Select label="الجنس" error={errors.gender?.message} {...register("gender")}>
          <option value="female">أنثى</option>
          <option value="male">ذكر</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="الوزن عند الولادة (غرام، اختياري)"
          type="number"
          placeholder="مثال: 3200"
          error={errors.weightGrams?.message}
          {...register("weightGrams")}
        />
        <Input
          label="الطول عند الولادة (سم، اختياري)"
          type="number"
          placeholder="مثال: 50"
          error={errors.heightCm?.message}
          {...register("heightCm")}
        />
      </div>

      <Button type="submit" loading={createBaby.isPending} className="w-full">
        إضافة الطفل
      </Button>
    </form>
  );
}
