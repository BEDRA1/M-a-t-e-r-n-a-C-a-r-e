import type { Metadata } from "next";
import { BabyContent } from "@/components/dashboard/baby/BabyContent";

export const metadata: Metadata = { title: "طفلي", robots: { index: false, follow: false } };

export default function BabyPage() {
  return <BabyContent />;
}
