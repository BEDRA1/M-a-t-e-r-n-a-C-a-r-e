/** رسمة "عدّاد أيام النفاس" — حلقة تقدّم دائرية بأسلوب هادئ يوحي بالراحة والمتابعة */
export function PostpartumCounterIllustration({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="عدّاد أيام النفاس">
      <div className="relative flex size-full animate-gentle-breathe items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-200/60 to-accent-200/50 blur-[6px]" />
        <svg viewBox="0 0 100 100" className="relative size-[85%]">
          <defs>
            <linearGradient id="postpartumRing" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--color-primary-400)" />
              <stop offset="100%" stopColor="var(--color-accent-400)" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="38" fill="none" stroke="var(--color-primary-100)" strokeWidth="9" />
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="url(#postpartumRing)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray="143 239"
            transform="rotate(-90 50 50)"
          />
          <text
            x="50"
            y="47"
            textAnchor="middle"
            fontSize="22"
            fontWeight="800"
            fill="var(--color-primary-700)"
          >
            ٤٠
          </text>
          <text x="50" y="62" textAnchor="middle" fontSize="8" fill="var(--muted)">
            يوم نفاس
          </text>
        </svg>
      </div>
    </div>
  );
}
