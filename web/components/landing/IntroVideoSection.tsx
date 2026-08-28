"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { fadeUp, viewportOnce } from "@/lib/motion";

/** قسم الفيديو التعريفي — يبدأ بغلاف ساكن (بديل صورة poster غير متوفرة)، وينتقل عند
 * الضغط لعنصر <video> حقيقي يشغّل public/videos/hero-intro.mp4 فعليًا */
export function IntroVideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp(0)}
        className="my-6"
      >
        {isPlaying ? (
          <video controls autoPlay className="aspect-video w-full rounded-2xl bg-gray-900">
            <source src="/videos/hero-intro.mp4" type="video/mp4" />
          </video>
        ) : (
          <button
            type="button"
            id="intro-video-placeholder"
            onClick={() => setIsPlaying(true)}
            className="relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-gray-900"
          >
            <div className="text-center text-white">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <Play className="ml-1 h-8 w-8 text-white" fill="white" />
              </div>
              <p className="font-bold text-lg">اكتشفي Materna Care</p>
              <p className="text-sm text-white/70">رفيقتك خلال رحلة الألف يوم</p>
            </div>
          </button>
        )}
      </motion.div>
    </section>
  );
}
