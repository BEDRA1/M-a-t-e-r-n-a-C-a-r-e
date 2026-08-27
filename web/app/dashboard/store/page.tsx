import type { Metadata } from "next";
import { StoreContent } from "@/components/dashboard/store/StoreContent";

export const metadata: Metadata = { title: "المتجر", robots: { index: false, follow: false } };

export default function StorePage() {
  return <StoreContent />;
}
