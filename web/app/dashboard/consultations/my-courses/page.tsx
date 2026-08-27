import type { Metadata } from "next";
import { MyCoursesContent } from "@/components/dashboard/consultations/MyCoursesContent";

export const metadata: Metadata = { title: "دوراتي", robots: { index: false, follow: false } };

export default function MyCoursesPage() {
  return <MyCoursesContent />;
}
