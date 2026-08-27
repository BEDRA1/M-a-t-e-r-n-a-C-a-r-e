import type { Metadata } from "next";
import { MyBookingsContent } from "@/components/dashboard/consultations/MyBookingsContent";

export const metadata: Metadata = { title: "حجوزاتي", robots: { index: false, follow: false } };

export default function MyBookingsPage() {
  return <MyBookingsContent />;
}
