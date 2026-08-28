/** أيقونة "السنة الأولى" — دائرة رمادية فاتحة + وجه طفل صغير، لشريط رحلة الـ1000 يوم */
export function BabyIcon({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="السنة الأولى">
      <svg viewBox="0 0 40 40" className="size-full">
        <circle cx="20" cy="20" r="20" fill="#F3F4F6" />
        <circle cx="20" cy="21" r="10" fill="none" stroke="#9CA3AF" strokeWidth="2.2" />
        <circle cx="16.2" cy="19" r="1.6" fill="#9CA3AF" />
        <circle cx="23.8" cy="19" r="1.6" fill="#9CA3AF" />
        <path d="M16 25c1.5 1.5 6.5 1.5 8 0" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 11c-2.2 0-3.2 1.6-3 3.2" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
