import type { Metadata } from "next";
import { TakeAssessmentContent } from "@/components/dashboard/assessments/TakeAssessmentContent";

export const metadata: Metadata = { title: "إجراء التقييم", robots: { index: false, follow: false } };

export default async function TakeAssessmentPage({ params }: { params: Promise<{ domainId: string }> }) {
  const { domainId } = await params;
  return <TakeAssessmentContent domainId={domainId} />;
}
