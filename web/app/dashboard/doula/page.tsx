import type { Metadata } from "next";
import { DoulaChatContent } from "@/components/dashboard/doula/DoulaChatContent";

export const metadata: Metadata = { title: "الدولا الرقمية", robots: { index: false, follow: false } };

export default function DoulaPage() {
  return <DoulaChatContent />;
}
