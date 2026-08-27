"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useUpdateBaby } from "@/lib/hooks/useBabies";
import { ApiError } from "@/lib/api-client";
import { babySchema, type BabyFormValues } from "@/lib/validation/baby";
import type { Baby } from "@/lib/types";

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

export function EditBabyForm({ baby, onDone }: { baby: Baby; onDone: () => void }) {
  const updateBaby = useUpdateBaby();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BabyFormValues>({
    resolver: zodResolver(babySchema),
    defaultValues: {
      fullName: baby.fullName,
      birthDate: toDateInputValue(baby.birthDate),
      gender: baby.gender,
      weightGrams: baby.weightGrams ? String(baby.weightGrams) : "",
      heightCm: baby.heightCm ? String(baby.heightCm) : "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await updateBaby.mutateAsync({
        id: baby.id,
        fullName: values.fullName,
        birthDate: new Date(values.birthDate).toISOString(),
        gender: values.gender,
        weightGrams: values.weightGrams ? Number(values.weightGrams) : undefined,
        heightCm: values.heightCm ? Number(values.heightCm) : undefined,
      });
      onDone();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "تعذّر حفظ التعديلات");
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {serverError && <Alert tone="error">{serverError}</Alert>}

      <Input label="اسم الطفل" error={errors.fullName?.message} {...register("fullName")} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="تاريخ الميلاد" type="date" error={errors.birthDate?.message} {...register("birthDate")} />
        <Select label="الجنس" error={errors.gender?.message} {...register("gender")}>
          <option value="female">أنثى</option>
          <option value="male">ذكر</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="الوزن (غرام، اختياري)"
          type="number"
          error={errors.weightGrams?.message}
          {...register("weightGrams")}
        />
        <Input
          label="الطول (سم، اختياري)"
          type="number"
          error={errors.heightCm?.message}
          {...register("heightCm")}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" loading={updateBaby.isPending} className="w-full sm:w-auto">
          حفظ التعديلات
        </Button>
        <Button type="button" variant="ghost" onClick={onDone} className="w-full sm:w-auto">
          إلغاء
        </Button>
      </div>
    </form>
  );
}
