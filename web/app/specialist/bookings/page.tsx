import type { Metadata } from "next";
import { SpecialistBookingsContent } from "@/components/specialist/SpecialistBookingsContent";

export const metadata: Metadata = { title: "حجوزاتي", robots: { index: false, follow: false } };

export default function SpecialistBookingsPage() {
  return <SpecialistBookingsContent />;
}
