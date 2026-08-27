/** رسمة "كتاب مفتوح وهلال" — تكوين هادئ يوحي بالطمأنينة الروحية */
export function ReligiousBookIllustration({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="محتوى ديني موثوق">
      <div className="relative flex size-full animate-gentle-breathe items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-200/60 to-primary-200/50 blur-[6px]" />
        <svg viewBox="0 0 100 100" className="relative size-[85%]">
          <defs>
            <linearGradient id="pageGradientStart" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-primary-200)" />
              <stop offset="100%" stopColor="var(--color-primary-300)" />
            </linearGradient>
            <linearGradient id="pageGradientEnd" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-accent-300)" />
              <stop offset="100%" stopColor="var(--color-accent-200)" />
            </linearGradient>
          </defs>

          <circle cx="30" cy="24" r="11" fill="var(--color-primary-300)" />
          <circle cx="34" cy="21" r="9.5" fill="var(--background)" />

          <path d="M50 42 L20 49 L20 78 L50 71 Z" fill="url(#pageGradientStart)" />
          <path d="M50 42 L80 49 L80 78 L50 71 Z" fill="url(#pageGradientEnd)" />
          <line x1="50" y1="42" x2="50" y2="71" stroke="var(--surface)" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}
