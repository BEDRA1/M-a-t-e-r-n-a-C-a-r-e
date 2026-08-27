import type { Metadata } from "next";
import { CoursesListContent } from "@/components/dashboard/consultations/CoursesListContent";

export const metadata: Metadata = {
  title: "الدورات التكوينية",
  robots: { index: false, follow: false },
};

export default function CoursesPage() {
  return <CoursesListContent />;
}
