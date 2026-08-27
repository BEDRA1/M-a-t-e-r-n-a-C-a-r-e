import type { Metadata } from "next";
import { CourseDetailContent } from "@/components/dashboard/consultations/CourseDetailContent";

export const metadata: Metadata = {
  title: "تفاصيل الدورة",
  robots: { index: false, follow: false },
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CourseDetailContent courseId={id} />;
}
