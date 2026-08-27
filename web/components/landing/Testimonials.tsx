"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { useTestimonials } from "@/lib/hooks/useTestimonials";

export function Testimonials() {
  const testimonials = useTestimonials();
  const items = testimonials.data ?? [];

  if (testimonials.isLoading || items.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp(0)}
        className="mx-auto max-w-2xl"
      >
        <h2 className="text-center text-xl font-bold text-primary-600">ماذا تقول أمهاتنا؟</h2>
        <p className="mt-2 text-center text-sm text-gray-500">آلاف الأمهات يثقن بـ Materna Care</p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.12, 0.1)}
        className={[
          "mt-10 flex gap-4 overflow-x-auto pb-2",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:pb-0",
        ].join(" ")}
      >
        {items.map((testimonial) => (
          <motion.div key={testimonial.id} variants={fadeUp(0)} className="min-w-[280px] shrink-0 sm:min-w-0 sm:shrink">
            <div className="min-w-[280px] rounded-2xl bg-white p-4 shadow-sm sm:min-w-0">
              <div className="mb-2 flex justify-end gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={
                      star <= testimonial.rating ? "size-4 fill-yellow-400 text-yellow-400" : "size-4 text-black/15"
                    }
                  />
                ))}
              </div>
              <p className="mb-3 text-right text-sm leading-relaxed text-gray-700">&ldquo;{testimonial.content}&rdquo;</p>
              <p className="text-right text-xs text-gray-400">— {testimonial.displayName || "أم جزائرية"}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
