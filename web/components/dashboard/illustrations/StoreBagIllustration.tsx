/** رسمة "حقيبة تسوّق" — بشكل بسيط بخطوط ناعمة ومقابض منحنية */
export function StoreBagIllustration({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="منتجات مختارة للأم والطفل">
      <div className="relative flex size-full animate-gentle-breathe items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-200/60 to-accent-200/50 blur-[6px]" />
        <svg viewBox="0 0 100 100" className="relative size-[85%]">
          <defs>
            <linearGradient id="bagGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary-300)" />
              <stop offset="100%" stopColor="var(--color-primary-500)" />
            </linearGradient>
          </defs>

          <path
            d="M30 36 Q30 16 50 16 Q70 16 70 36"
            fill="none"
            stroke="var(--color-accent-400)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M27 36 L73 36 L79 82 Q79 87 74 87 L26 87 Q21 87 21 82 Z"
            fill="url(#bagGradient)"
          />
          <circle cx="42" cy="55" r="4" fill="var(--surface)" opacity="0.9" />
          <circle cx="58" cy="55" r="4" fill="var(--surface)" opacity="0.9" />
          <circle cx="50" cy="66" r="4" fill="var(--surface)" opacity="0.9" />
        </svg>
      </div>
    </div>
  );
}
