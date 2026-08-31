"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  epdsClassificationLabel,
  epdsClassificationTone,
  gad7ClassificationLabel,
  gad7ClassificationTone,
  ptsdClassificationLabel,
  ptsdClassificationTone,
} from "@/lib/format";
import { ASSESSMENT_DISCLAIMER_AR } from "@/lib/assessment-disclaimer";
import type { AssessmentDomainName, SubmitAssessmentResponse } from "@/lib/types";

export function AssessmentResultView({ result }: { result: SubmitAssessmentResponse }) {
  const domainName = result.domain.name as AssessmentDomainName;
  let label: string;
  let tone: "success" | "accent" | "warning" | "danger";
  if (domainName === "gad7") {
    label = gad7ClassificationLabel(result.classification);
    tone = gad7ClassificationTone(result.classification);
  } else if (domainName === "ptsd") {
    label = ptsdClassificationLabel(result.classification);
    tone = ptsdClassificationTone(result.classification);
  } else {
    label = epdsClassificationLabel(result.classification);
    tone = epdsClassificationTone(result.classification);
  }

  return (
    <Card className="mx-auto flex max-w-xl flex-col items-center gap-5 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="size-7" strokeWidth={2} />
      </span>

      <div>
        <p className="text-sm text-muted">نتيجتك في {result.domain.nameAr}</p>
        <div className="mt-2">
          <Badge tone={tone}>{label}</Badge>
        </div>
      </div>

      <p className="max-w-md text-sm leading-relaxed text-muted">
        هذه النتيجة لمحة أولية عن حالتك خلال الفترة الماضية، وليست تشخيصًا. إن رغبتِ في التحدث مع
        مختصة حول ما شعرتِ به، يمكنك ذلك في أي وقت — دون أي إلحاح.
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/dashboard/consultations/psychological">
          <Button variant="outline" size="sm">
            التحدث مع أخصائية نفسانية (اختياري)
          </Button>
        </Link>
        <Link href="/dashboard/assessments/history">
          <Button variant="ghost" size="sm">
            عرض سجل نتائجي
          </Button>
        </Link>
      </div>

      <p className="max-w-md text-xs leading-relaxed text-muted">{ASSESSMENT_DISCLAIMER_AR}</p>
    </Card>
  );
}
