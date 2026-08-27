import type { Metadata } from "next";
import { SubscriptionsContent } from "@/components/dashboard/subscriptions/SubscriptionsContent";

export const metadata: Metadata = { title: "الخدمات الإضافية", robots: { index: false, follow: false } };

export default function SubscriptionsPage() {
  return <SubscriptionsContent />;
}
