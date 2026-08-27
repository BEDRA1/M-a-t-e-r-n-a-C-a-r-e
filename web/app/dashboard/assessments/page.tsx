import type { Metadata } from "next";
import { AssessmentsListContent } from "@/components/dashboard/assessments/AssessmentsListContent";

export const metadata: Metadata = { title: "التقييم النفسي", robots: { index: false, follow: false } };

export default function AssessmentsPage() {
  return <AssessmentsListContent />;
}
