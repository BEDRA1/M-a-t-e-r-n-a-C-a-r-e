import type { Metadata } from "next";
import { ProfileContent } from "@/components/dashboard/profile/ProfileContent";

export const metadata: Metadata = { title: "ملفي الشخصي", robots: { index: false, follow: false } };

export default function ProfilePage() {
  return <ProfileContent />;
}
