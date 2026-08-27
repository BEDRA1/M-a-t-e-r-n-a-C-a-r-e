import type { Metadata } from "next";
import { MoodTrackingContent } from "@/components/dashboard/mood/MoodTrackingContent";

export const metadata: Metadata = { title: "حالتي المزاجية", robots: { index: false, follow: false } };

export default function MoodPage() {
  return <MoodTrackingContent />;
}
