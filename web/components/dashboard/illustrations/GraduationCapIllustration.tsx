/** رسمة "قبعة تخرّج" — ترمز للدورات التكوينية والتعلّم */
export function GraduationCapIllustration({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="دورات تكوينية وتعلّم">
      <div className="relative flex size-full animate-gentle-breathe items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-200/60 to-accent-200/50 blur-[6px]" />
        <svg viewBox="0 0 100 100" className="relative size-[85%]">
          <defs>
            <linearGradient id="capGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--color-primary-300)" />
              <stop offset="100%" stopColor="var(--color-primary-500)" />
            </linearGradient>
          </defs>

          <rect x="38" y="56" width="24" height="18" rx="4" fill="var(--color-accent-200)" opacity="0.9" />
          <path d="M50 28 L88 46 L50 64 L12 46 Z" fill="url(#capGradient)" />
          <path
            d="M50 28 L88 46 L50 64 L12 46 Z"
            fill="none"
            stroke="var(--color-primary-600)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <line x1="80" y1="46" x2="80" y2="68" stroke="var(--color-accent-500)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="80" cy="72" r="4" fill="var(--color-accent-500)" />
        </svg>
      </div>
    </div>
  );
}
