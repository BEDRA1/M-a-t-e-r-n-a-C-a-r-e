import type { Metadata } from "next";
import { FamilyPageContent } from "./FamilyPageContent";

export const metadata: Metadata = {
  title: "العائلة",
  robots: { index: false, follow: false },
};

export default function FamilyPage() {
  return <FamilyPageContent />;
}
