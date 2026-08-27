import type { Metadata } from "next";
import { SpecialistDashboardContent } from "@/components/specialist/SpecialistDashboardContent";

export const metadata: Metadata = { title: "لوحة الأخصائي", robots: { index: false, follow: false } };

export default function SpecialistDashboardPage() {
  return <SpecialistDashboardContent />;
}
