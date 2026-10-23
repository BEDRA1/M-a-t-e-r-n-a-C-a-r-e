/** أيقونة "السنة الثانية" — دائرة رمادية فاتحة + طفل واقف بجسم وذراعين وساقين مرسومة كأشكال
 * مليئة (رأس دائري، جسم بذلة مستدير، ذراعان وساقان بخطوط سميكة)، بنفس عائلة أشكال بقية
 * أيقونات الشريط بدل مخطط عصا رفيع */
export function ToddlerIcon({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="السنة الثانية">
      <svg viewBox="0 0 120 140" className="size-full">
        <circle cx="60" cy="80" r="52" fill="#F3F4F6" />
        <circle cx="60" cy="42" r="17" fill="#D1D5DB" />
        <path
          d="M38 66c0-11 10-17 22-17s22 6 22 17v18c0 5-6 8-22 8s-22-3-22-8Z"
          fill="#9CA3AF"
        />
        <path d="M40 68c-8 4-13 13-12 22" fill="none" stroke="#9CA3AF" strokeWidth="7" strokeLinecap="round" />
        <path d="M80 68c8 4 13 13 12 22" fill="none" stroke="#9CA3AF" strokeWidth="7" strokeLinecap="round" />
        <path d="M50 90l-7 22" fill="none" stroke="#9CA3AF" strokeWidth="8" strokeLinecap="round" />
        <path d="M70 90l7 22" fill="none" stroke="#9CA3AF" strokeWidth="8" strokeLinecap="round" />
      </svg>
    </div>
  );
}
