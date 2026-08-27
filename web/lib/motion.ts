import type { Variants } from "framer-motion";

/** ظهور تدريجي مع انزلاق خفيف من الأسفل (لا حركة أفقية، لتفادي مشاكل اتجاه RTL) */
export function fadeUp(delay = 0, distance = 24): Variants {
  return {
    hidden: { opacity: 0, y: distance },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: "easeOut" } },
  };
}

export function fadeIn(delay = 0): Variants {
  return {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, delay, ease: "easeOut" } },
  };
}

/** للعناصر المرئية/البطاقات التوضيحية */
export function scaleIn(delay = 0): Variants {
  return {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay, ease: "easeOut" } },
  };
}

/** حاوية لتفعيل تأخير متدرج بين العناصر الأبناء */
export function staggerContainer(stagger = 0.12, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren } },
  };
}

export const viewportOnce = { once: true, margin: "-80px" } as const;
