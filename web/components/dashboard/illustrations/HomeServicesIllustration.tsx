/** رسمة "منزل مُعتنى به" — بيت بسيط بخطوط ناعمة مع لمسات نظافة صغيرة حوله */
export function HomeServicesIllustration({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="خدمات منزلية موثوقة">
      <div className="relative flex size-full animate-gentle-breathe items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-200/60 to-primary-200/50 blur-[6px]" />
        <svg viewBox="0 0 100 100" className="relative size-[85%]">
          <defs>
            <linearGradient id="roofGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--color-primary-400)" />
              <stop offset="100%" stopColor="var(--color-primary-600)" />
            </linearGradient>
            <linearGradient id="wallGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent-200)" />
              <stop offset="100%" stopColor="var(--color-accent-400)" />
            </linearGradient>
          </defs>

          <path d="M50 18 L83 44 L17 44 Z" fill="url(#roofGradient)" />
          <rect x="26" y="44" width="48" height="36" rx="5" fill="url(#wallGradient)" />
          <rect x="43" y="58" width="14" height="22" rx="3" fill="var(--surface)" />

          <circle cx="18" cy="26" r="2.5" fill="var(--color-primary-300)" />
          <circle cx="26" cy="18" r="1.8" fill="var(--color-accent-300)" />
          <circle cx="82" cy="28" r="2.2" fill="var(--color-primary-300)" />
        </svg>
      </div>
    </div>
  );
}
