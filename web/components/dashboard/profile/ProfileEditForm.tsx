"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useUpdateMe } from "@/lib/hooks/useAuth";
import { ApiError } from "@/lib/api-client";
import { ALGERIAN_WILAYAS } from "@/lib/wilayas";
import { updateProfileSchema, type UpdateProfileFormValues } from "@/lib/validation/profile";
import type { User } from "@/lib/types";

export function ProfileEditForm({ user }: { user: User }) {
  const updateMe = useUpdateMe();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { email: user.email ?? "", wilaya: user.wilaya ?? "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      await updateMe.mutateAsync({
        email: values.email || undefined,
        wilaya: values.wilaya || undefined,
      });
      setSuccessMessage("تم حفظ التعديلات بنجاح");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "تعذّر حفظ التعديلات");
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {serverError && <Alert tone="error">{serverError}</Alert>}
      {successMessage && <Alert tone="success">{successMessage}</Alert>}

      <Input
        label="البريد الإلكتروني"
        type="email"
        placeholder="user@example.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <Select label="الولاية" error={errors.wilaya?.message} {...register("wilaya")}>
        <option value="">بدون تحديد</option>
        {ALGERIAN_WILAYAS.map((wilaya) => (
          <option key={wilaya.code} value={wilaya.name}>
            {wilaya.code} - {wilaya.name}
          </option>
        ))}
      </Select>

      <Button type="submit" loading={updateMe.isPending} className="w-full sm:w-auto">
        حفظ التعديلات
      </Button>
    </form>
  );
}
