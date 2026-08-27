"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useChangePassword } from "@/lib/hooks/useAuth";
import { ApiError } from "@/lib/api-client";
import { changePasswordSchema, type ChangePasswordFormValues } from "@/lib/validation/profile";

export function ChangePasswordForm() {
  const changePassword = useChangePassword();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      reset();
      setSuccessMessage("تم تغيير كلمة المرور بنجاح");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "تعذّر تغيير كلمة المرور");
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {serverError && <Alert tone="error">{serverError}</Alert>}
      {successMessage && <Alert tone="success">{successMessage}</Alert>}

      <Input
        label="كلمة المرور الحالية"
        type="password"
        error={errors.currentPassword?.message}
        {...register("currentPassword")}
      />
      <Input
        label="كلمة المرور الجديدة"
        type="password"
        hint="8 أحرف على الأقل"
        error={errors.newPassword?.message}
        {...register("newPassword")}
      />
      <Input
        label="تأكيد كلمة المرور الجديدة"
        type="password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button type="submit" loading={changePassword.isPending} className="w-full sm:w-auto">
        تغيير كلمة المرور
      </Button>
    </form>
  );
}
