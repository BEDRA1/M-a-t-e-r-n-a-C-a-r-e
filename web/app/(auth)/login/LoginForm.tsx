"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useLogin } from "@/lib/hooks/useAuth";
import { ApiError } from "@/lib/api-client";
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await login.mutateAsync(values);
      const redirect = searchParams.get("redirect") ?? "/dashboard";
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "تعذّر تسجيل الدخول");
    }
  });

  return (
    <Card>
      <h1 className="text-2xl font-extrabold text-foreground">تسجيل الدخول</h1>
      <p className="mt-1 text-sm text-muted">أهلًا بعودتك، سجّلي دخولك لمتابعة رحلتك</p>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        {serverError && <Alert tone="error">{serverError}</Alert>}

        <Input
          label="رقم الهاتف"
          type="tel"
          placeholder="0555123456"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <Input
          label="كلمة المرور"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button type="submit" size="lg" loading={login.isPending} className="mt-2">
          تسجيل الدخول
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        ليس لديك حساب؟{" "}
        <Link href="/register" className="font-semibold text-primary-600 hover:underline">
          إنشاء حساب جديد
        </Link>
      </p>
    </Card>
  );
}
