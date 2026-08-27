import type { Metadata } from "next";
import { WeeklyTrackingContent } from "./WeeklyTrackingContent";

export const metadata: Metadata = {
  title: "المتابعة الأسبوعية",
  robots: { index: false, follow: false },
};

export default function WeeklyTrackingPage() {
  return <WeeklyTrackingContent />;
}
