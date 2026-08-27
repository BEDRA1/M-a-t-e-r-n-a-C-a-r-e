import type { Metadata } from "next";
import { PregnancyCalculatorPageContent } from "./PregnancyCalculatorPageContent";

export const metadata: Metadata = {
  title: "حاسبة الحمل",
  robots: { index: false, follow: false },
};

export default function PregnancyCalculatorPage() {
  return <PregnancyCalculatorPageContent />;
}
