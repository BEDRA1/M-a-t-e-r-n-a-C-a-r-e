/** رسمة روبوت ودود بسيطة بالبنفسجي — هوية الدولا الرقمية البصرية، بلا أي إيموجي */
export function DoulaRobotIllustration({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="روبوت الدولا الرقمية">
      <div className="relative flex size-full animate-gentle-breathe items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-doula-200/60 to-doula-400/40 blur-[6px]" />
        <svg viewBox="0 0 100 100" className="relative size-[85%]">
          <defs>
            <linearGradient id="doulaHeadGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--color-doula-400)" />
              <stop offset="100%" stopColor="var(--color-doula-600)" />
            </linearGradient>
          </defs>

          {/* هوائي */}
          <line x1="50" y1="14" x2="50" y2="24" stroke="var(--color-doula-500)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="11" r="4.5" fill="var(--color-doula-400)" />

          {/* أذنان */}
          <circle cx="22" cy="46" r="5" fill="var(--color-doula-300)" />
          <circle cx="78" cy="46" r="5" fill="var(--color-doula-300)" />

          {/* الرأس */}
          <rect x="26" y="24" width="48" height="42" rx="14" fill="url(#doulaHeadGradient)" />

          {/* عينان */}
          <rect x="36" y="38" width="12" height="14" rx="6" fill="white" />
          <rect x="52" y="38" width="12" height="14" rx="6" fill="white" />
          <circle cx="42" cy="46" r="2.6" fill="var(--color-doula-700)" />
          <circle cx="58" cy="46" r="2.6" fill="var(--color-doula-700)" />

          {/* ابتسامة */}
          <path
            d="M 40 57 Q 50 63 60 57"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* الجسم */}
          <rect x="33" y="70" width="34" height="20" rx="10" fill="var(--color-doula-300)" />
          <circle cx="50" cy="80" r="4" fill="white" opacity="0.8" />
        </svg>
      </div>
    </div>
  );
}
