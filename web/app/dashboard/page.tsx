import type { Metadata } from "next";
import { DashboardHome } from "./DashboardHome";

export const metadata: Metadata = {
  title: "لوحتي",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <DashboardHome />;
}
