/** رسمة "منحنى النمو" — أعمدة متصاعدة ترمز لتتبع نمو الطفل عبر الوقت */
export function BabyGrowthIllustration({ className }: { className?: string }) {
  const bars = [
    { x: 16, height: 18 },
    { x: 36, height: 30 },
    { x: 56, height: 42 },
    { x: 76, height: 54 },
  ];
  const baseline = 82;

  return (
    <div className={className} role="img" aria-label="منحنى نمو الطفل">
      <div className="relative flex size-full animate-gentle-breathe items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-200/60 to-primary-200/50 blur-[6px]" />
        <svg viewBox="0 0 100 100" className="relative size-[85%]">
          <defs>
            <linearGradient id="growthBarGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="var(--color-accent-300)" />
              <stop offset="100%" stopColor="var(--color-accent-500)" />
            </linearGradient>
          </defs>

          <line x1="10" y1={baseline} x2="90" y2={baseline} stroke="var(--color-primary-100)" strokeWidth="2" />

          {bars.map((bar) => (
            <rect
              key={bar.x}
              x={bar.x - 6}
              y={baseline - bar.height}
              width="12"
              height={bar.height}
              rx="4"
              fill="url(#growthBarGradient)"
            />
          ))}

          <circle cx={bars[3].x} cy={baseline - bars[3].height - 9} r="7" fill="var(--color-primary-400)" />
        </svg>
      </div>
    </div>
  );
}
