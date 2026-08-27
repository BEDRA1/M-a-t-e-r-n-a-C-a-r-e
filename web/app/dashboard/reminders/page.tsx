import type { Metadata } from "next";
import { RemindersPageContent } from "./RemindersPageContent";

export const metadata: Metadata = {
  title: "التذكيرات",
  robots: { index: false, follow: false },
};

export default function RemindersPage() {
  return <RemindersPageContent />;
}
