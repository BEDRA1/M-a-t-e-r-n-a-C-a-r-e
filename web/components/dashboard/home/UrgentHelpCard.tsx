"use client";

import { CheckCircle2 } from "lucide-react";
import { useCreateManualUrgentHelp } from "@/lib/hooks/useUrgentHelp";
import { ApiError } from "@/lib/api-client";
import { UrgentHelpIcon } from "./icons/UrgentHelpIcon";

export function UrgentHelpCard() {
  const createRequest = useCreateManualUrgentHelp();

  if (createRequest.isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-emerald-50 p-3 text-center">
        <CheckCircle2 className="size-8 text-emerald-600" strokeWidth={2} />
        <p className="text-xs font-bold text-emerald-700">وصل طلبك، سنتواصل معكِ قريباً</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-primary-50 p-3">
      <UrgentHelpIcon className="size-12" />
      <p className="mt-2 text-sm font-bold text-primary-700">طلب المساعدة المستعجل</p>
      <p className="mt-1 text-xs text-gray-500">خدمة فورية عند الحاجة</p>
      {createRequest.isError && (
        <p className="mt-1 text-xs text-red-600">
          {createRequest.error instanceof ApiError ? createRequest.error.message : "تعذّر إرسال الطلب"}
        </p>
      )}
      <button
        type="button"
        disabled={createRequest.isPending}
        onClick={() => createRequest.mutate(undefined)}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full bg-red-500 py-2 text-xs text-white disabled:opacity-60"
      >
        {createRequest.isPending && (
          <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        طلب مساعدة الآن
      </button>
    </div>
  );
}
