/** أيقونة "السنة الثانية" — دائرة رمادية فاتحة + طفل أكبر يقف، لشريط رحلة الـ1000 يوم */
export function ToddlerIcon({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="السنة الثانية">
      <svg viewBox="0 0 40 40" className="size-full">
        <circle cx="20" cy="20" r="20" fill="#F3F4F6" />
        <circle cx="20" cy="11" r="4" fill="#9CA3AF" />
        <path d="M20 15v9" stroke="#9CA3AF" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M20 18l-6-2.5M20 18l6-2.5" stroke="#9CA3AF" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M20 24l-5 9M20 24l5 9" stroke="#9CA3AF" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}
