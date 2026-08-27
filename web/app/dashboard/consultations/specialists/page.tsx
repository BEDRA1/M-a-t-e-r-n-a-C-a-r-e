import type { Metadata } from "next";
import { SpecialistsListContent } from "@/components/dashboard/consultations/SpecialistsListContent";

export const metadata: Metadata = {
  title: "قائمة الأخصائيين",
  robots: { index: false, follow: false },
};

export default function SpecialistsPage() {
  return <SpecialistsListContent />;
}
