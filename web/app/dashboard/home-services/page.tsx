import type { Metadata } from "next";
import { HomeServicesContent } from "@/components/dashboard/home-services/HomeServicesContent";

export const metadata: Metadata = {
  title: "الخدمات المنزلية",
  robots: { index: false, follow: false },
};

export default function HomeServicesPage() {
  return <HomeServicesContent />;
}
