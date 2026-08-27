import type { Metadata } from "next";
import { HealthNutritionContent } from "@/components/dashboard/health-nutrition/HealthNutritionContent";

export const metadata: Metadata = {
  title: "الصحة والتغذية",
  robots: { index: false, follow: false },
};

export default function HealthNutritionPage() {
  return <HealthNutritionContent />;
}
