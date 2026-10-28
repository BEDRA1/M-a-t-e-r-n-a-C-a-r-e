"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Baby } from "lucide-react";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useCreatePregnancy, useUpdatePregnancy, type CreatePregnancyInput } from "@/lib/hooks/usePregnancy";
import { lmpInputBounds } from "@/lib/pregnancy-stage";
import { ApiError } from "@/lib/api-client";
import { formatArabicDate } from "@/lib/format";
import {
  lmpSchema,
  ovulationSchema,
  ultrasoundSchema,
} from "@/lib/validation/pregnancy";
import type { Pregnancy, PregnancyCalcMethod } from "@/lib/types";

type Mode = "create" | "edit";

/** إنشاء حمل جديد (POST) أو تصحيح تاريخ الحمل النشط (PATCH) — نفس النماذج الثلاثة */
function useSavePregnancy(mode: Mode) {
  const create = useCreatePregnancy();
  const update = useUpdatePregnancy();
  const mutation = mode === "create" ? create : update;
  return {
    isPending: mutation.isPending,
    save: (input: CreatePregnancyInput): Promise<Pregnancy> =>
      mode === "create" ? create.mutateAsync(input) : update.mutateAsync(input),
  };
}

const tabs: { id: PregnancyCalcMethod; label: string }[] = [
  { id: "lmp", label: "آخر دورة شهرية" },
  { id: "ovulation", label: "تاريخ الإباضة" },
  { id: "ultrasound", label: "فحص السونار" },
];

function LmpForm({ onResult, mode }: { onResult: (p: Pregnancy) => void; mode: Mode }) {
  const createPregnancy = useSavePregnancy(mode);
  const bounds = lmpInputBounds();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ lmpDate: string }>({ resolver: zodResolver(lmpSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const result = await createPregnancy.save({ calcMethod: "lmp", ...values });
      onResult(result);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "تعذّر حساب الحمل");
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {serverError && <Alert tone="error">{serverError}</Alert>}
      <Input
        label="تاريخ أول يوم من آخر دورة شهرية"
        type="date"
        min={bounds.min}
        max={bounds.max}
        error={errors.lmpDate?.message}
        {...register("lmpDate")}
      />
      <Button type="submit" loading={createPregnancy.isPending}>
        {mode === "edit" ? "حفظ التاريخ الجديد" : "احسبي الآن"}
      </Button>
    </form>
  );
}

function OvulationForm({ onResult, mode }: { onResult: (p: Pregnancy) => void; mode: Mode }) {
  const createPregnancy = useSavePregnancy(mode);
  const bounds = lmpInputBounds();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ conceptionDate: string }>({ resolver: zodResolver(ovulationSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const result = await createPregnancy.save({ calcMethod: "ovulation", ...values });
      onResult(result);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "تعذّر حساب الحمل");
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {serverError && <Alert tone="error">{serverError}</Alert>}
      <Input
        label="تاريخ الإباضة أو الإخصاب"
        type="date"
        min={bounds.min}
        max={bounds.max}
        error={errors.conceptionDate?.message}
        {...register("conceptionDate")}
      />
      <Button type="submit" loading={createPregnancy.isPending}>
        {mode === "edit" ? "حفظ التاريخ الجديد" : "احسبي الآن"}
      </Button>
    </form>
  );
}

function UltrasoundForm({ onResult, mode }: { onResult: (p: Pregnancy) => void; mode: Mode }) {
  const createPregnancy = useSavePregnancy(mode);
  const bounds = lmpInputBounds();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ ultrasoundDate: string; ultrasoundWeeks: string }>({
    resolver: zodResolver(ultrasoundSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const result = await createPregnancy.save({
        calcMethod: "ultrasound",
        ultrasoundDate: values.ultrasoundDate,
        ultrasoundWeeks: Number(values.ultrasoundWeeks),
      });
      onResult(result);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "تعذّر حساب الحمل");
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {serverError && <Alert tone="error">{serverError}</Alert>}
      <Input
        label="تاريخ فحص السونار"
        type="date"
        min={bounds.min}
        max={bounds.max}
        error={errors.ultrasoundDate?.message}
        {...register("ultrasoundDate")}
      />
      <Input
        label="عمر الحمل بالأسابيع وقت الفحص"
        type="number"
        min={1}
        max={42}
        placeholder="مثال: 12"
        error={errors.ultrasoundWeeks?.message}
        {...register("ultrasoundWeeks")}
      />
      <Button type="submit" loading={createPregnancy.isPending}>
        {mode === "edit" ? "حفظ التاريخ الجديد" : "احسبي الآن"}
      </Button>
    </form>
  );
}

function ResultPanel({ result }: { result: Pregnancy | null }) {
  if (!result) {
    return (
      <Card className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted lg:sticky lg:top-24">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary-50 text-primary-500">
          <Baby className="size-7" strokeWidth={2} />
        </span>
        <p className="text-sm">
          ستظهر هنا نتيجة الحساب: عمر حملك وتاريخ ولادتك المتوقع، بمجرد إدخال البيانات
          وضغط «احسبي الآن».
        </p>
      </Card>
    );
  }

  return (
    <Card className="lg:sticky lg:top-24">
      <h2 className="text-lg font-bold text-foreground">نتيجة الحساب</h2>
      <div className="mt-4">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold text-primary-700">
            الأسبوع {result.gestationalAge.weeks} + {result.gestationalAge.days} يوم
          </span>
          <span className="text-muted">{result.gestationalAge.progressPercent}٪</span>
        </div>
        <div className="mt-2">
          <ProgressBar percent={result.gestationalAge.progressPercent} />
        </div>
      </div>
      <p className="mt-4 text-sm text-muted">
        تاريخ الولادة المتوقع:{" "}
        <span className="font-semibold text-foreground">{formatArabicDate(result.dueDate)}</span>
      </p>
    </Card>
  );
}

export function PregnancyCalculatorForm({ mode = "create", onDone }: { mode?: Mode; onDone?: (p: Pregnancy) => void }) {
  const [activeTab, setActiveTab] = useState<PregnancyCalcMethod>("lmp");
  const [result, setResult] = useState<Pregnancy | null>(null);
  const handleResult = (p: Pregnancy) => {
    setResult(p);
    onDone?.(p);
  };

  const tabsCard = (
      <Card>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary-500 text-white"
                  : "bg-primary-50 text-foreground/70 hover:bg-primary-100",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === "lmp" && <LmpForm mode={mode} onResult={handleResult} />}
          {activeTab === "ovulation" && <OvulationForm mode={mode} onResult={handleResult} />}
          {activeTab === "ultrasound" && <UltrasoundForm mode={mode} onResult={handleResult} />}
        </div>
      </Card>
  );

  if (mode === "edit") return tabsCard;

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      {tabsCard}
      <ResultPanel result={result} />
    </div>
  );
}
