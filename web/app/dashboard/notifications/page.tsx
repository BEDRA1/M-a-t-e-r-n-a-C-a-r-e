import type { Metadata } from "next";
import { NotificationsList } from "@/components/dashboard/NotificationsList";

export const metadata: Metadata = { title: "الإشعارات", robots: { index: false, follow: false } };

export default function NotificationsPage() {
  return <NotificationsList />;
}
