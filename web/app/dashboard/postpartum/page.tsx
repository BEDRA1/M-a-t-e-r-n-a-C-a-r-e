import type { Metadata } from "next";
import { PostpartumContent } from "@/components/dashboard/postpartum/PostpartumContent";

export const metadata: Metadata = { title: "النفاس", robots: { index: false, follow: false } };

export default function PostpartumPage() {
  return <PostpartumContent />;
}
