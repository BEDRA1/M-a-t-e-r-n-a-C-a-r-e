"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Handshake, KeyRound, Share2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import {
  useCreateInvite,
  useFamily,
  useJoinFamily,
  useUnlinkSpouse,
} from "@/lib/hooks/useFamily";
import { ApiError } from "@/lib/api-client";
import { joinFamilySchema, type JoinFamilyFormValues } from "@/lib/validation/family";

function MotherView() {
  const family = useFamily();
  const createInvite = useCreateInvite();
  const unlink = useUnlinkSpouse();
  const [copied, setCopied] = useState(false);

  if (family.isLoading) {
    return (
      <Card>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-4 h-10 w-full" />
      </Card>
    );
  }

  if (!family.data) {
    return (
      <Card className="text-center">
        <h2 className="text-lg font-bold text-foreground">اربطي زوجك بحسابك</h2>
        <p className="mt-2 text-sm text-muted">
          أنشئي كود دعوة، وشاركيه مع زوجك ليتابع معكِ رحلة حملك.
        </p>
        <div className="mt-4">
          <Button onClick={() => createInvite.mutate()} loading={createInvite.isPending}>
            إنشاء كود دعوة
          </Button>
        </div>
        {createInvite.isError && (
          <div className="mt-4">
            <Alert tone="error">
              {createInvite.error instanceof ApiError
                ? createInvite.error.message
                : "تعذّر إنشاء كود الدعوة"}
            </Alert>
          </div>
        )}
      </Card>
    );
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(family.data.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <h2 className="text-lg font-bold text-foreground">كود دعوة زوجك</h2>
      <p className="mt-1 text-sm text-muted">شاركي هذا الكود مع زوجك ليتمكن من الانضمام.</p>

      <div className="mt-4 flex items-center gap-3">
        <span className="rounded-xl bg-primary-50 px-6 py-3 text-2xl font-extrabold tracking-widest text-primary-700">
          {family.data.inviteCode}
        </span>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4" strokeWidth={2.25} />
              تم النسخ
            </span>
          ) : (
            "نسخ الكود"
          )}
        </Button>
      </div>

      <div className="mt-6 border-t border-black/5 pt-4">
        {family.data.spouseUserId ? (
          <div className="flex items-center justify-between">
            <Badge tone="success">الزوج مرتبط بحسابك</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => unlink.mutate()}
              loading={unlink.isPending}
            >
              فك الارتباط
            </Button>
          </div>
        ) : (
          <Badge tone="neutral">بانتظار انضمام الزوج</Badge>
        )}
      </div>
    </Card>
  );
}

function SpouseView() {
  const family = useFamily();
  const join = useJoinFamily();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinFamilyFormValues>({ resolver: zodResolver(joinFamilySchema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await join.mutateAsync(values.inviteCode);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "تعذّر الانضمام إلى العائلة");
    }
  });

  if (family.isLoading) {
    return (
      <Card>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-4 h-10 w-full" />
      </Card>
    );
  }

  if (family.data) {
    return (
      <Card>
        <h2 className="text-lg font-bold text-foreground">أنتِ مرتبط بالعائلة</h2>
        <p className="mt-2 text-sm text-muted">
          يمكنك الآن متابعة رحلة الحمل من صفحة "المتابعة الأسبوعية".
        </p>
        <Badge tone="success" className="mt-4">
          مرتبط
        </Badge>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-lg font-bold text-foreground">انضم إلى عائلتك</h2>
      <p className="mt-1 text-sm text-muted">أدخل كود الدعوة الذي شاركته معك زوجتك.</p>

      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4" noValidate>
        {serverError && <Alert tone="error">{serverError}</Alert>}
        <Input
          label="كود الدعوة"
          placeholder="A1B2C3"
          maxLength={6}
          className="text-center text-lg tracking-widest uppercase"
          error={errors.inviteCode?.message}
          {...register("inviteCode")}
        />
        <Button type="submit" loading={join.isPending}>
          انضمام
        </Button>
      </form>
    </Card>
  );
}

function InfoPanel() {
  const steps = [
    { icon: KeyRound, text: "الأم تُنشئ كود دعوة من 6 أحرف من هذه الصفحة." },
    { icon: Share2, text: "تشارك الكود مع زوجها بأي وسيلة تناسبهما." },
    { icon: Handshake, text: "الزوج يُدخل الكود من حسابه ليصبحا مرتبطين." },
  ];

  return (
    <Card className="h-fit bg-primary-50/40">
      <h2 className="text-base font-bold text-foreground">كيف يعمل الربط؟</h2>
      <ul className="mt-4 flex flex-col gap-4">
        {steps.map((step) => (
          <li key={step.text} className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <step.icon className="size-4" strokeWidth={2} />
            </span>
            <span className="text-sm text-muted">{step.text}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function FamilyPageContent() {
  const currentUser = useCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">العائلة</h1>
        <p className="mt-1 text-sm text-muted">اربطي حسابك مع زوجك لمتابعة مشتركة لرحلة الحمل.</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {currentUser.isLoading ? (
            <Card>
              <Skeleton className="h-6 w-40" />
            </Card>
          ) : currentUser.data?.role === "spouse" ? (
            <SpouseView />
          ) : (
            <MotherView />
          )}
        </div>

        <InfoPanel />
      </div>
    </div>
  );
}
