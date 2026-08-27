import type { Metadata } from "next";
import { TrackChooserContent } from "@/components/dashboard/consultations/TrackChooserContent";

export const metadata: Metadata = { title: "الاستشارات", robots: { index: false, follow: false } };

export default function ConsultationsPage() {
  return <TrackChooserContent />;
}
