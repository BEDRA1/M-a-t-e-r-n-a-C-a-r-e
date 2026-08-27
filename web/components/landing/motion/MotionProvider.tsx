"use client";

import { MotionConfig } from "framer-motion";

/**
 * يحترم إعداد نظام التشغيل "تقليل الحركة" (prefers-reduced-motion) تلقائيًا:
 * عند تفعيله تُعطَّل حركات transform/scale وتبقى حركات الشفافية فقط.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
