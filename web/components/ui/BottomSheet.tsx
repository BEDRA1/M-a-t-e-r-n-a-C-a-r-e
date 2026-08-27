"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * مكوّن مشترك قابل لإعادة الاستخدام: ينزلق من الأسفل على الهاتف (<640px)، ويتحول
 * إلى مودال مركزي على الديسكتوب. غير مطبَّق على أي صفحة حاليًا — جاهز للدفعات القادمة.
 */
export function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={isDesktop ? { opacity: 0, scale: 0.95, x: "-50%", y: "-50%" } : { y: "100%" }}
            animate={isDesktop ? { opacity: 1, scale: 1, x: "-50%", y: "-50%" } : { y: 0 }}
            exit={isDesktop ? { opacity: 0, scale: 0.95, x: "-50%", y: "-50%" } : { y: "100%" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={cn(
              "fixed z-50 overflow-y-auto bg-surface shadow-2xl",
              isDesktop
                ? "start-1/2 top-1/2 max-h-[85vh] w-full max-w-md rounded-3xl p-6"
                : "inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]",
              className,
            )}
          >
            {!isDesktop && <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-black/10" aria-hidden="true" />}

            <div className="mb-4 flex items-center justify-between gap-3">
              {title ? <h2 className="text-lg font-bold text-foreground">{title}</h2> : <span />}
              <button
                type="button"
                onClick={onClose}
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black/5 text-foreground/70 transition-colors hover:bg-black/10"
                aria-label="إغلاق"
              >
                <X className="size-5" />
              </button>
            </div>

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
