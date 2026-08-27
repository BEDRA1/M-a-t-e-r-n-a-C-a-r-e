import type { Metadata } from "next";
import { ReligiousContent } from "@/components/dashboard/religious-content/ReligiousContent";

export const metadata: Metadata = {
  title: "المحتوى الديني",
  robots: { index: false, follow: false },
};

export default function ReligiousContentPage() {
  return <ReligiousContent />;
}
