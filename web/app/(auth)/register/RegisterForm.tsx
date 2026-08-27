"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Baby, Check, Flower2, Sprout } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/lib/cn";
import { useRegister, type RegisterInput } from "@/lib/hooks/useAuth";
import { useCreatePregnancy, useUpdatePregnancy } from "@/lib/hooks/usePregnancy";
import { useCreateBaby } from "@/lib/hooks/useBabies";
import { ApiError } from "@/lib/api-client";
import { registerSchema, type RegisterFormValues } from "@/lib/validation/auth";

type MaternityStage = "pregnant" | "postpartum" | "newborn";

interface PregnantData {
  lmpDate: string;
  isFirst: boolean | null;
  previousCount: string;
  hasCondition: boolean | null;
  conditionNote: string;
}

interface PostpartumData {
  birthDate: string;
  deliveryType: "natural" | "cesarean" | null;
  hasComplications: boolean | null;
  isBreastfeeding: boolean | null;
  hasCondition: boolean | null;
  conditionNote: string;
}

interface NewbornData {
  birthDate: string;
  name: string;
  gender: "male" | "female" | null;
}

function YesNo({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          "flex-1 rounded-xl border-2 py-2 text-sm font-semibold transition-colors",
          value === true ? "border-primary-400 bg-primary-50 text-primary-700" : "border-black/10 text-foreground/70",
        )}
      >
        نعم
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          "flex-1 rounded-xl border-2 py-2 text-sm font-semibold transition-colors",
          value === false ? "border-primary-400 bg-primary-50 text-primary-700" : "border-black/10 text-foreground/70",
        )}
      >
        لا
      </button>
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Values, setStep1Values] = useState<RegisterFormValues | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [stage, setStage] = useState<MaternityStage | null>(null);
  const [isSubmittingStage2, setIsSubmittingStage2] = useState(false);

  const [pregnant, setPregnant] = useState<PregnantData>({
    lmpDate: "",
    isFirst: null,
    previousCount: "",
    hasCondition: null,
    conditionNote: "",
  });
  const [postpartum, setPostpartum] = useState<PostpartumData>({
    birthDate: "",
    deliveryType: null,
    hasComplications: null,
    isBreastfeeding: null,
    hasCondition: null,
    conditionNote: "",
  });
  const [newborn, setNewborn] = useState<NewbornData>({ birthDate: "", name: "", gender: null });

  const registerUser = useRegister();
  const createPregnancy = useCreatePregnancy();
  const updatePregnancy = useUpdatePregnancy();
  const createBaby = useCreateBaby();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "mother" },
  });

  function toRegisterInput(values: RegisterFormValues): RegisterInput {
    return { ...values, email: values.email || undefined, dateOfBirth: values.dateOfBirth || undefined };
  }

  const goNext = handleSubmit(async (values) => {
    setServerError(null);
    if (values.role !== "mother") {
      // الزوج لا يحتاج خطوة رحلة الأمومة — إنشاء الحساب مباشرة والتوجيه للوحة التحكم
      try {
        await registerUser.mutateAsync(toRegisterInput(values));
        router.push("/dashboard");
        router.refresh();
      } catch (err) {
        setServerError(err instanceof ApiError ? err.message : "تعذّر إنشاء الحساب");
      }
      return;
    }
    setStep1Values(values);
    setStep(2);
  });

  const stageValid = (() => {
    if (!stage) return false;
    if (stage === "pregnant") return Boolean(pregnant.lmpDate) && pregnant.isFirst !== null;
    if (stage === "postpartum")
      return (
        Boolean(postpartum.birthDate) &&
        postpartum.deliveryType !== null &&
        postpartum.hasComplications !== null &&
        postpartum.isBreastfeeding !== null
      );
    return Boolean(newborn.birthDate) && newborn.name.trim().length > 0 && newborn.gender !== null;
  })();

  const finishRegistration = async () => {
    if (!step1Values || !stage) return;
    setServerError(null);
    setIsSubmittingStage2(true);

    try {
      await registerUser.mutateAsync(toRegisterInput(step1Values));
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "تعذّر إنشاء الحساب");
      setIsSubmittingStage2(false);
      return;
    }

    // فشل حفظ بيانات المرحلة (حمل/نفاس/طفل) لا يمنع الدخول — الحساب أُنشئ بنجاح بالفعل،
    // ويمكن إضافة هذه البيانات لاحقًا من لوحة التحكم
    try {
      if (stage === "pregnant") {
        await createPregnancy.mutateAsync({
          calcMethod: "lmp",
          lmpDate: pregnant.lmpDate,
          isFirstPregnancy: pregnant.isFirst ?? undefined,
          previousPregnanciesCount: pregnant.isFirst ? undefined : Number(pregnant.previousCount) || 0,
          hasHealthCondition: pregnant.hasCondition ?? false,
          healthConditionNote: pregnant.hasCondition ? pregnant.conditionNote || undefined : undefined,
        });
      } else if (stage === "postpartum") {
        const backdatedLmp = new Date(postpartum.birthDate);
        backdatedLmp.setDate(backdatedLmp.getDate() - 280);
        await createPregnancy.mutateAsync({
          calcMethod: "lmp",
          lmpDate: backdatedLmp.toISOString().slice(0, 10),
        });
        await updatePregnancy.mutateAsync({
          status: "completed",
          birthDate: postpartum.birthDate,
          deliveryType: postpartum.deliveryType ?? undefined,
          hasComplications: postpartum.hasComplications ?? false,
          isBreastfeeding: postpartum.isBreastfeeding ?? false,
          hasHealthCondition: postpartum.hasCondition ?? false,
          healthConditionNote: postpartum.hasCondition ? postpartum.conditionNote || undefined : undefined,
        });
      } else {
        await createBaby.mutateAsync({
          fullName: newborn.name,
          birthDate: newborn.birthDate,
          gender: newborn.gender!,
        });
      }
    } catch {
      // متعمّد: يُتجاهَل بصمت — الحساب موجود، والدخول لا يجب أن يُحجَب بسبب هذه الخطوة
    }

    router.push("/dashboard");
    router.refresh();
  };

  if (step === 2) {
    return (
      <Card>
        <h1 className="text-2xl font-extrabold text-foreground">أين أنتِ في رحلة الأمومة؟</h1>
        <p className="mt-1 text-sm text-muted">هذه المعلومات تساعدنا على تخصيص متابعتك لكِ</p>

        {serverError && (
          <div className="mt-4">
            <Alert tone="error">{serverError}</Alert>
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(
            [
              { key: "pregnant", label: "أنا حامل", icon: Sprout },
              { key: "postpartum", label: "أنا في فترة النفاس", icon: Flower2 },
              { key: "newborn", label: "أنا بعد الولادة", icon: Baby },
            ] as const
          ).map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setStage(option.key)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-5 text-center transition-colors",
                stage === option.key
                  ? "border-primary-400 bg-primary-50"
                  : "border-black/10 bg-surface hover:border-primary-200",
              )}
            >
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-2xl",
                  stage === option.key ? "bg-primary-500 text-white" : "bg-primary-50 text-primary-500",
                )}
              >
                <option.icon className="size-5" strokeWidth={2} />
              </span>
              <span className="text-sm font-semibold text-foreground">{option.label}</span>
              {stage === option.key && <Check className="size-4 text-primary-500" strokeWidth={2.5} />}
            </button>
          ))}
        </div>

        {stage === "pregnant" && (
          <div className="mt-6 flex flex-col gap-4">
            <Input
              label="تاريخ آخر دورة شهرية"
              type="date"
              value={pregnant.lmpDate}
              onChange={(e) => setPregnant((p) => ({ ...p, lmpDate: e.target.value }))}
            />
            <div>
              <p className="mb-1.5 text-sm font-medium text-foreground">هل هذا حملك الأول؟</p>
              <YesNo value={pregnant.isFirst} onChange={(v) => setPregnant((p) => ({ ...p, isFirst: v }))} />
            </div>
            {pregnant.isFirst === false && (
              <Input
                label="عدد الأحمال السابقة"
                type="number"
                min={0}
                max={20}
                value={pregnant.previousCount}
                onChange={(e) => setPregnant((p) => ({ ...p, previousCount: e.target.value }))}
              />
            )}
            <div>
              <p className="mb-1.5 text-sm font-medium text-foreground">هل تعانين من مرض أو حالة صحية؟</p>
              <YesNo value={pregnant.hasCondition} onChange={(v) => setPregnant((p) => ({ ...p, hasCondition: v }))} />
            </div>
            {pregnant.hasCondition === true && (
              <Input
                label="حددي المرض/الحالة الصحية"
                value={pregnant.conditionNote}
                onChange={(e) => setPregnant((p) => ({ ...p, conditionNote: e.target.value }))}
              />
            )}
          </div>
        )}

        {stage === "postpartum" && (
          <div className="mt-6 flex flex-col gap-4">
            <Input
              label="تاريخ الولادة"
              type="date"
              value={postpartum.birthDate}
              onChange={(e) => setPostpartum((p) => ({ ...p, birthDate: e.target.value }))}
            />
            <div>
              <p className="mb-1.5 text-sm font-medium text-foreground">نوع الولادة</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPostpartum((p) => ({ ...p, deliveryType: "natural" }))}
                  className={cn(
                    "flex-1 rounded-xl border-2 py-2 text-sm font-semibold transition-colors",
                    postpartum.deliveryType === "natural"
                      ? "border-primary-400 bg-primary-50 text-primary-700"
                      : "border-black/10 text-foreground/70",
                  )}
                >
                  طبيعية
                </button>
                <button
                  type="button"
                  onClick={() => setPostpartum((p) => ({ ...p, deliveryType: "cesarean" }))}
                  className={cn(
                    "flex-1 rounded-xl border-2 py-2 text-sm font-semibold transition-colors",
                    postpartum.deliveryType === "cesarean"
                      ? "border-primary-400 bg-primary-50 text-primary-700"
                      : "border-black/10 text-foreground/70",
                  )}
                >
                  قيصرية
                </button>
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-foreground">هل توجد مضاعفات؟</p>
              <YesNo
                value={postpartum.hasComplications}
                onChange={(v) => setPostpartum((p) => ({ ...p, hasComplications: v }))}
              />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-foreground">هل ترضعين طبيعياً؟</p>
              <YesNo
                value={postpartum.isBreastfeeding}
                onChange={(v) => setPostpartum((p) => ({ ...p, isBreastfeeding: v }))}
              />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-foreground">هل تعانين من مرض أو حالة صحية؟</p>
              <YesNo
                value={postpartum.hasCondition}
                onChange={(v) => setPostpartum((p) => ({ ...p, hasCondition: v }))}
              />
            </div>
            {postpartum.hasCondition === true && (
              <Input
                label="حددي المرض/الحالة الصحية"
                value={postpartum.conditionNote}
                onChange={(e) => setPostpartum((p) => ({ ...p, conditionNote: e.target.value }))}
              />
            )}
          </div>
        )}

        {stage === "newborn" && (
          <div className="mt-6 flex flex-col gap-4">
            <Input
              label="اسم الطفل"
              value={newborn.name}
              onChange={(e) => setNewborn((p) => ({ ...p, name: e.target.value }))}
            />
            <Input
              label="تاريخ ميلاد الطفل"
              type="date"
              value={newborn.birthDate}
              onChange={(e) => setNewborn((p) => ({ ...p, birthDate: e.target.value }))}
            />
            <div>
              <p className="mb-1.5 text-sm font-medium text-foreground">جنس الطفل</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewborn((p) => ({ ...p, gender: "male" }))}
                  className={cn(
                    "flex-1 rounded-xl border-2 py-2 text-sm font-semibold transition-colors",
                    newborn.gender === "male"
                      ? "border-primary-400 bg-primary-50 text-primary-700"
                      : "border-black/10 text-foreground/70",
                  )}
                >
                  ذكر
                </button>
                <button
                  type="button"
                  onClick={() => setNewborn((p) => ({ ...p, gender: "female" }))}
                  className={cn(
                    "flex-1 rounded-xl border-2 py-2 text-sm font-semibold transition-colors",
                    newborn.gender === "female"
                      ? "border-primary-400 bg-primary-50 text-primary-700"
                      : "border-black/10 text-foreground/70",
                  )}
                >
                  أنثى
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button
            size="lg"
            className="flex-1"
            disabled={!stageValid}
            loading={isSubmittingStage2}
            onClick={finishRegistration}
          >
            إنشاء الحساب
          </Button>
          <Button size="lg" variant="ghost" className="flex-1" onClick={() => setStep(1)}>
            رجوع
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="text-2xl font-extrabold text-foreground">إنشاء حساب جديد</h1>
      <p className="mt-1 text-sm text-muted">انضمي إلى Materna Care وابدئي متابعة رحلتك</p>

      <form onSubmit={goNext} className="mt-6 flex flex-col gap-4" noValidate>
        {serverError && <Alert tone="error">{serverError}</Alert>}

        <Select label="أنتِ" error={errors.role?.message} {...register("role")}>
          <option value="mother">أم</option>
          <option value="spouse">زوج مرافق</option>
        </Select>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            placeholder="8 أحرف على الأقل"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="البريد الإلكتروني (اختياري)"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="الولاية (اختياري)"
            type="text"
            placeholder="الجزائر العاصمة"
            error={errors.wilaya?.message}
            {...register("wilaya")}
          />
        </div>
        <Input
          label="تاريخ الميلاد (اختياري)"
          type="date"
          error={errors.dateOfBirth?.message}
          {...register("dateOfBirth")}
        />

        <Button type="submit" size="lg" loading={registerUser.isPending} className="mt-2">
          التالي
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        لديك حساب بالفعل؟{" "}
        <Link href="/login" className="font-semibold text-primary-600 hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </Card>
  );
}
