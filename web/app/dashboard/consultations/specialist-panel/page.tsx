import type { Metadata } from "next";
import { SpecialistPanelContent } from "@/components/dashboard/consultations/SpecialistPanelContent";

export const metadata: Metadata = {
  title: "لوحة الأخصائي",
  robots: { index: false, follow: false },
};

export default function SpecialistPanelPage() {
  return <SpecialistPanelContent />;
}
