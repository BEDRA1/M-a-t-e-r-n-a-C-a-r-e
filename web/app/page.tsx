import type { Metadata } from "next";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { IntroVideoSection } from "@/components/landing/IntroVideoSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { IntroSplash } from "@/components/landing/IntroSplash";
import { MotionProvider } from "@/components/landing/motion/MotionProvider";

export const metadata: Metadata = {
  title: "Materna Care — رفيقتكِ من الحمل حتى ما بعد الولادة",
  description:
    "منصة Materna Care الجزائرية: حاسبة حمل دقيقة بثلاث طرق، متابعة أسبوعية لتطور الجنين، تذكيرات صحية، وربط بزوجك لمتابعة مشتركة لرحلة الحمل.",
  alternates: { canonical: "/" },
};

export default function LandingPage() {
  return (
    <MotionProvider>
      <IntroSplash />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <IntroVideoSection />
        <Testimonials />
        <Features />
        <HowItWorks />
        <CtaSection />
      </main>
      <SiteFooter />
    </MotionProvider>
  );
}
