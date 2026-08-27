/** رسمة "تاج" — ترمز لباقات الاشتراك ومزاياها */
export function SubscriptionCrownIllustration({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="باقات الاشتراك">
      <div className="relative flex size-full animate-gentle-breathe items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-200/60 to-accent-200/50 blur-[6px]" />
        <svg viewBox="0 0 100 100" className="relative size-[85%]">
          <defs>
            <linearGradient id="crownGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent-300)" />
              <stop offset="100%" stopColor="var(--color-primary-500)" />
            </linearGradient>
          </defs>

          <path d="M22 66 L30 36 L44 53 L50 30 L56 53 L70 36 L78 66 Z" fill="url(#crownGradient)" />
          <rect x="20" y="66" width="60" height="10" rx="3" fill="var(--color-primary-400)" />
          <circle cx="30" cy="36" r="4.5" fill="var(--surface)" />
          <circle cx="50" cy="30" r="4.5" fill="var(--surface)" />
          <circle cx="70" cy="36" r="4.5" fill="var(--surface)" />
        </svg>
      </div>
    </div>
  );
}
