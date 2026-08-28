"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { useCreateManualUrgentHelp } from "@/lib/hooks/useUrgentHelp";
import { ApiError } from "@/lib/api-client";
import { UrgentHelpIcon } from "./icons/UrgentHelpIcon";

export function UrgentHelpCard() {
  const createRequest = useCreateManualUrgentHelp();
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const submit = () => {
    createRequest.mutate(notes.trim() || undefined);
  };

  const closeAndReset = () => {
    setIsOpen(false);
    createRequest.reset();
    setNotes("");
  };

  return (
    <>
      <div className="rounded-2xl bg-primary-50 p-3">
        <UrgentHelpIcon className="size-12" />
        <p className="mt-2 text-sm font-bold text-primary-700">طلب المساعدة المستعجل</p>
        <p className="mt-1 text-xs text-gray-500">خدمة فورية عند الحاجة</p>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full bg-red-500 py-2 text-xs text-white"
        >
          طلب مساعدة الآن
        </button>
      </div>

      <BottomSheet open={isOpen} onClose={closeAndReset} title="طلبي المساعدة">
        {createRequest.isSuccess ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="size-10 text-emerald-600" strokeWidth={2} />
            <p className="font-bold text-foreground">تم استلام طلبك، سنتواصل معكِ في أقرب وقت</p>
            <Button onClick={closeAndReset} className="w-full justify-center">
              حسنًا
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتبي رسالتك... مثال: أحتاج إلى أخصائية نفسانية بسرعة"
              rows={4}
              maxLength={1000}
              className="w-full resize-none rounded-xl border border-black/10 bg-surface p-3 text-sm text-foreground placeholder:text-muted focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
            {createRequest.isError && (
              <p className="text-xs text-red-600">
                {createRequest.error instanceof ApiError ? createRequest.error.message : "تعذّر إرسال الطلب"}
              </p>
            )}
            <Button
              onClick={submit}
              loading={createRequest.isPending}
              className="w-full justify-center !bg-red-500 hover:!bg-red-600"
            >
              إرسال الطلب
            </Button>
          </div>
        )}
      </BottomSheet>
    </>
  );
}
