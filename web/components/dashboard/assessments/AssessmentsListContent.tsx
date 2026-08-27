"use client";

import Link from "next/link";
import { Brain, ClipboardList, HeartPulse, History } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";
import { useAssessmentDomains } from "@/lib/hooks/useAssessments";
import { ASSESSMENT_DISCLAIMER_AR } from "@/lib/assessment-disclaimer";
import { ApiError } from "@/lib/api-client";
import { ManualUrgentHelpButton } from "./ManualUrgentHelpButton";
import type { AssessmentDomain } from "@/lib/types";

const DOMAIN_ICON = { gad7: Brain, epds: HeartPulse } as const;

export function AssessmentsListContent() {
  const domains = useAssessmentDomains();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge tone="primary">دعم نفسي وتوعية ذاتية</Badge>
          <h1 className="mt-3 text-2xl font-extrabold text-foreground sm:text-3xl">التقييم النفسي</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            مقاييس معيارية قصيرة تساعدك على فهم حالتك النفسية بشكل أفضل، بخصوصية تامة.
          </p>
        </div>
        <Link href="/dashboard/assessments/history">
          <Button variant="outline" size="sm">
            <History className="size-4" strokeWidth={2} />
            سجل نتائجي
          </Button>
        </Link>
      </div>

      <ManualUrgentHelpButton />

      {domains.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : domains.isError ? (
        <Alert tone="error">
          {domains.error instanceof ApiError ? domains.error.message : "تعذّر تحميل قائمة المقاييس"}
        </Alert>
      ) : !domains.data || domains.data.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-10 text-center text-muted">
          <ClipboardList className="size-8 text-primary-300" strokeWidth={1.5} />
          <p>لا توجد مقاييس متاحة حاليًا.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {domains.data.map((domain: AssessmentDomain) => {
            const Icon = DOMAIN_ICON[domain.name as keyof typeof DOMAIN_ICON] ?? ClipboardList;
            return (
              <Card key={domain.id} className="flex flex-col gap-3">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
                  <Icon className="size-6" strokeWidth={2} />
                </span>
                <div className="flex-1">
                  <p className="font-extrabold text-foreground">{domain.nameAr}</p>
                  {domain.descriptionAr && (
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{domain.descriptionAr}</p>
                  )}
                </div>
                <Link href={`/dashboard/assessments/${domain.id}`}>
                  <Button className="w-full justify-center">ابدئي التقييم</Button>
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-xs leading-relaxed text-muted">{ASSESSMENT_DISCLAIMER_AR}</p>
    </div>
  );
}
