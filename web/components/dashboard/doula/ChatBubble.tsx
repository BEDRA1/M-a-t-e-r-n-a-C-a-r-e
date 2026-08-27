"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Bot } from "lucide-react";
import { cn } from "@/lib/cn";

/** فقاعة الأم — يمين الشاشة، وردي فاتح (RTL: flex justify-start يضع العنصر عند البداية المرئية أي اليمين) */
export function MotherBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl bg-primary-100 px-4 py-3 text-sm leading-relaxed text-primary-900 sm:max-w-[75%]">
        {children}
      </div>
    </div>
  );
}

/** فقاعة الدولا — يسار الشاشة، بنفسجية فاتحة مع أيقونة روبوت صغيرة، تدخل بانزلاق خفيف من اليسار */
export function DoulaBubble({ children, className }: { children: React.ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex justify-end gap-2"
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl border border-doula-100 bg-doula-50 px-4 py-3 text-sm leading-relaxed text-foreground shadow-[var(--shadow-soft)] sm:max-w-[75%]",
          className,
        )}
      >
        {children}
      </div>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-doula-100 text-doula-600">
        <Bot className="size-4" strokeWidth={2} />
      </span>
    </motion.div>
  );
}
