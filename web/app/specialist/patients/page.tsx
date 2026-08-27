import type { Metadata } from "next";
import { SpecialistPatientsContent } from "@/components/specialist/SpecialistPatientsContent";

export const metadata: Metadata = { title: "مريضاتي", robots: { index: false, follow: false } };

export default function SpecialistPatientsPage() {
  return <SpecialistPatientsContent />;
}
