import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export const metadata: Metadata = { title: "المفضلة", robots: { index: false, follow: false } };

export default function FavoritesPage() {
  return (
    <ComingSoonPage
      icon={Heart}
      title="المفضلة"
      description="احفظي نصائحك ومحتواك المفضل هنا للرجوع إليه بسهولة في أي وقت."
    />
  );
}
