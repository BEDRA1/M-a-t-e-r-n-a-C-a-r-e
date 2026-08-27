"use client";

import { useState } from "react";
import { HeartHandshake, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useCreateManualUrgentHelp } from "@/lib/hooks/useUrgentHelp";
import { ApiError } from "@/lib/api-client";

/** بوابة سلامة يدوية متاحة في أي وقت — بلا حاجة لإجراء أي تقييم أولًا */
export function ManualUrgentHelpButton() {
  const [confirming, setConfirming] = useState(false);
  const createRequest = useCreateManualUrgentHelp();

  if (createRequest.isSuccess) {
    return (
      <Card className="flex items-start gap-3 border-2 border-emerald-200 bg-emerald-50/60">
        <CheckCircle className="mt-0.5 size-5 shrink-0 text-emerald-600" strokeWidth={2} />
        <div>
          <p className="font-bold text-foreground">وصل طلبك إلينا</p>
          <p className="mt-1 text-sm text-muted">سيتواصل معكِ أحد فريقنا في أقرب وقت ممكن. لستِ وحدك.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3 border-2 border-accent-200 bg-accent-50/40">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent-100 text-accent-700">
          <HeartHandshake className="size-5" strokeWidth={2} />
        </span>
        <div>
          <p className="font-bold text-foreground">هل تحتاجين للتحدث مع أحد الآن؟</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            إن كنتِ تمرين بلحظة صعبة، لا تترددي. طلب المساعدة قوة لا ضعف.
          </p>
        </div>
      </div>

      {createRequest.isError && (
        <Alert tone="error">
          {createRequest.error instanceof ApiError ? createRequest.error.message : "تعذّر إرسال الطلب"}
        </Alert>
      )}

      {confirming ? (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            loading={createRequest.isPending}
            onClick={() => createRequest.mutate(undefined)}
          >
            نعم، أحتاج للتحدث مع أحد الآن
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
            تراجع
          </Button>
        </div>
      ) : (
        <Button variant="secondary" size="sm" className="self-start" onClick={() => setConfirming(true)}>
          أحتاج للتحدث مع أحد الآن
        </Button>
      )}
    </Card>
  );
}
