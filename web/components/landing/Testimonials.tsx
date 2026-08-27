"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
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
        className="mx-auto max-w-2xl text-center"
      >
        <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">آراء الأمهات</h2>
        <p className="mt-4 text-muted">تجارب حقيقية من أمهات رافقهن تطبيق Materna Care في رحلتهن</p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.12, 0.1)}
        className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {items.map((testimonial) => (
          <motion.div key={testimonial.id} variants={fadeUp(0)}>
            <Card className="h-full text-start">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    className={value <= testimonial.rating ? "size-4 fill-amber-400 text-amber-400" : "size-4 text-black/20"}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/80">{testimonial.content}</p>
              <p className="mt-4 text-sm font-bold text-primary-700">{testimonial.displayName || "أم"}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
