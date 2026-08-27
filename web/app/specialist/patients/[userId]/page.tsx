import type { Metadata } from "next";
import { PatientDetailContent } from "@/components/specialist/PatientDetailContent";

export const metadata: Metadata = { title: "ملف المريضة", robots: { index: false, follow: false } };

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <PatientDetailContent userId={userId} />;
}
