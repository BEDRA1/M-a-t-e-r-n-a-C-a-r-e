import type { Metadata } from "next";
import { SpecialistDetailContent } from "@/components/dashboard/consultations/SpecialistDetailContent";

export const metadata: Metadata = {
  title: "تفاصيل الأخصائي",
  robots: { index: false, follow: false },
};

export default async function SpecialistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SpecialistDetailContent specialistId={id} />;
}
