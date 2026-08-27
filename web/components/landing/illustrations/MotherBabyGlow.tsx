/**
 * رسمة SVG مخصصة "أم تحتضن طفلها" — بديل عن Lottie حقيقي لم أجد له رابطًا يمكن
 * التحقق منه (lottiefiles.com يرفض الطلبات الآلية بـ 403). أشكال بيضاوية متراكبة
 * ناعمة بدل رمز إيموجي، مع نبضة "تنفّس" لطيفة بـ CSS خالص (بلا حلقة JS مستمرة)
 * تحترم prefers-reduced-motion تلقائيًا عبر globals.css.
 */
export function MotherBabyGlow({ className }: { className?: string }) {
  return (
    <div role="img" aria-label="أم تحتضن طفلها بحنان" className={className}>
      <div className="relative flex size-full animate-gentle-breathe items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-200/70 to-accent-200/60 blur-[6px]" />
        <svg viewBox="0 0 100 100" className="relative size-[85%]">
          <defs>
            <linearGradient id="motherGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary-300)" />
              <stop offset="100%" stopColor="var(--color-primary-500)" />
            </linearGradient>
            <linearGradient id="babyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent-200)" />
              <stop offset="100%" stopColor="var(--color-accent-400)" />
            </linearGradient>
          </defs>

          {/* جسد الأم */}
          <ellipse cx="50" cy="66" rx="30" ry="30" fill="url(#motherGradient)" />
          {/* رأس الأم */}
          <circle cx="50" cy="26" r="15" fill="url(#motherGradient)" />

          {/* جسد الطفل */}
          <ellipse cx="50" cy="70" rx="13" ry="15" fill="url(#babyGradient)" />
          {/* رأس الطفل */}
          <circle cx="50" cy="53" r="9" fill="url(#babyGradient)" />

          {/* قلب صغير يرمز للحنان */}
          <path
            d="M50 40.5c-1.6-1.9-4.3-2.6-6.4-1.2-2 1.3-2.6 4-1.1 6l7.5 8 7.5-8c1.5-2 0.9-4.7-1.1-6-2.1-1.4-4.8-0.7-6.4 1.2z"
            fill="var(--surface)"
            opacity="0.9"
          />
        </svg>
      </div>
    </div>
  );
}
