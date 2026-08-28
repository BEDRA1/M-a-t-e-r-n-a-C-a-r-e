import type { Metadata } from "next";
import Link from "next/link";
import { IntroVideoSection } from "@/components/landing/IntroVideoSection";
import { MotionProvider } from "@/components/landing/motion/MotionProvider";

export const metadata: Metadata = {
  title: "Materna Care — رفيقتكِ من الحمل حتى ما بعد الولادة",
  description:
    "منصة Materna Care الجزائرية: رفيقتك من الحمل حتى ما بعد الولادة.",
  alternates: { canonical: "/" },
};

// صفحة هبوط مبسّطة بالكامل بطلب صريح: فيديو + زر تسجيل فقط، بلا أي قسم آخر (لا هيدر، لا
// تذييل، لا أقسام تعريفية) — نفس التصميم السابق (commit b261533)، أُعيد اعتماده بعد توفير
// ملف hero-intro.mp4 الحقيقي في public/videos/ (IntroVideoSection يشغّله الآن بدل intro.mp4)
export default function LandingPage() {
  return (
    <MotionProvider>
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-b from-primary-50 to-white px-4 py-10">
        <div className="w-full max-w-2xl">
          <IntroVideoSection />
        </div>

        <Link
          href="/register"
          className="w-full max-w-xs rounded-full bg-gradient-primary px-8 py-4 text-center text-lg font-extrabold text-white shadow-lg shadow-primary-500/30 transition-transform duration-200 hover:scale-105 active:scale-100"
        >
          سجّلي الآن
        </Link>
      </main>
    </MotionProvider>
  );
}
