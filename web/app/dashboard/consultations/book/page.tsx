import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSpinner } from "@/components/ui/Spinner";
import { BookingWizard } from "@/components/dashboard/consultations/BookingWizard";

export const metadata: Metadata = {
  title: "حجز استشارة جديدة",
  robots: { index: false, follow: false },
};

export default function BookConsultationPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <BookingWizard />
    </Suspense>
  );
}
