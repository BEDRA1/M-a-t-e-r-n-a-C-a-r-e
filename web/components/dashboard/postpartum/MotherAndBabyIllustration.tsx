/** رسمة تجريدية بسيطة بالوردي — أم تحتضن طفلها، بنفس أسلوب رسمة الدولا (أشكال هندسية، بلا أي إيموجي) */
export function MotherAndBabyIllustration({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="أم تحتضن طفلها">
      <div className="relative flex size-full animate-gentle-breathe items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-200/60 to-primary-400/40 blur-[6px]" />
        <svg viewBox="0 0 100 100" className="relative size-[85%]">
          <defs>
            <linearGradient id="motherGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--color-primary-300)" />
              <stop offset="100%" stopColor="var(--color-primary-500)" />
            </linearGradient>
          </defs>

          {/* جسد الأم المنحني في وضعية احتضان */}
          <path d="M18 92 Q18 54 50 48 Q82 54 82 92 Z" fill="url(#motherGradient)" />

          {/* رأس الأم */}
          <circle cx="50" cy="28" r="16" fill="url(#motherGradient)" />

          {/* جسد الطفل المحتضَن */}
          <ellipse cx="52" cy="70" rx="13" ry="15" fill="var(--color-primary-100)" />

          {/* رأس الطفل */}
          <circle cx="50" cy="56" r="8.5" fill="var(--color-primary-200)" />

          {/* قلب صغير بينهما يرمز للدفء */}
          <path
            d="M50 43 C48 40 43.5 40 43.5 44 C43.5 47 50 52 50 52 S56.5 47 56.5 44 C56.5 40 52 40 50 43 Z"
            fill="white"
            opacity="0.85"
          />
        </svg>
      </div>
    </div>
  );
}
