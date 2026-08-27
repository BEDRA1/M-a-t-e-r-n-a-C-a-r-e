import type { Metadata } from "next";
import { AssessmentHistoryContent } from "@/components/dashboard/assessments/AssessmentHistoryContent";

export const metadata: Metadata = { title: "سجل نتائجي", robots: { index: false, follow: false } };

export default function AssessmentHistoryPage() {
  return <AssessmentHistoryContent />;
}
