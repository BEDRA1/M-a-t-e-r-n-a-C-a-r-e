/** أيقونة "السنة الأولى" — دائرة رمادية فاتحة + وجه طفل صغير مرسوم بأشكال مليئة (لا مخطط
 * رفيع)، بخدّين ورديين وخصلة شعر، ليطابق أسلوب الرسم المليء المستخدَم في بقية أيقونات الشريط */
export function BabyIcon({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="السنة الأولى">
      <svg viewBox="0 0 120 140" className="size-full">
        <circle cx="60" cy="80" r="52" fill="#F3F4F6" />
        <path d="M60 42c-17 0-28 13-28 32s12 34 28 34 28-15 28-34-11-32-28-32Z" fill="#D1D5DB" />
        <path d="M60 42c-5-9 0-16 9-18" fill="none" stroke="#D1D5DB" strokeWidth="6" strokeLinecap="round" />
        <circle cx="47" cy="76" r="8" fill="#F9A8C9" opacity="0.55" />
        <circle cx="73" cy="76" r="8" fill="#F9A8C9" opacity="0.55" />
        <circle cx="49" cy="70" r="5" fill="#6B7280" />
        <circle cx="71" cy="70" r="5" fill="#6B7280" />
        <path d="M49 88c5 5 17 5 22 0" fill="none" stroke="#6B7280" strokeWidth="4.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
