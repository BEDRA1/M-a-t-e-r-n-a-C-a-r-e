import type { Metadata } from "next";
import { MothersSupportGroupContent } from "@/components/dashboard/mothers-support/MothersSupportGroupContent";

export const metadata: Metadata = { title: "مجموعة دعم الأمهات", robots: { index: false, follow: false } };

export default async function MothersSupportGroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group } = await params;
  return <MothersSupportGroupContent group={group} />;
}
