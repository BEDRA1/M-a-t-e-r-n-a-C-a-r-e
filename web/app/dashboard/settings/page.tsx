import type { Metadata } from "next";
import { SettingsContent } from "@/components/dashboard/settings/SettingsContent";

export const metadata: Metadata = { title: "الإعدادات", robots: { index: false, follow: false } };

export default function SettingsPage() {
  return <SettingsContent />;
}
