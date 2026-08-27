"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

// lottie-react يلمس window/document عند التحميل، لذا يُحمَّل فقط داخل المتصفح (لا SSR)
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface LottieIllustrationProps {
  /** رابط JSON مباشر لرسمة Lottie (من lottie.host أو assets-v2.lottiefiles.com مثلاً) */
  path: string;
  className?: string;
  loop?: boolean;
  ariaLabel?: string;
}

/**
 * مكوّن جاهز لعرض رسومات Lottie حقيقية لاحقًا (بمجرد توفر روابط مُتحقَّق منها):
 * - lazy: لا يُجلب ملف JSON إلا عند اقتراب العنصر من نطاق الرؤية
 * - يحترم prefers-reduced-motion: يعرض الإطار الأول ثابتًا بدل التشغيل التلقائي المتكرر
 * - lottie-react لا يدعم خاصية "path" مباشرة، لذا نجلب JSON يدويًا ونمرره كـ animationData
 */
export function LottieIllustration({
  path,
  className,
  loop = true,
  ariaLabel,
}: LottieIllustrationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "200px" });
  const shouldReduceMotion = useReducedMotion();
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    if (!isInView || animationData) return;
    let cancelled = false;
    fetch(path)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setAnimationData(data);
      })
      .catch(() => {
        /* فشل تحميل الرسمة لا يجب أن يكسر الصفحة — تبقى المساحة فارغة بصمت */
      });
    return () => {
      cancelled = true;
    };
  }, [isInView, path, animationData]);

  return (
    <div ref={ref} className={className} role="img" aria-label={ariaLabel}>
      {animationData && (
        <Lottie
          animationData={animationData}
          loop={Boolean(loop) && !shouldReduceMotion}
          autoplay={!shouldReduceMotion}
        />
      )}
    </div>
  );
}
