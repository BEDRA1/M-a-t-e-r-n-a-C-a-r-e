/** أيقونة "الحمل" — دائرة خضراء فاتحة + رأس ودائرتان (جسم + انتفاخ بطن أفتح)، أشكال دائرية
 * بحتة (لا مسارات مخصَّصة) لضمان وضوح الشكل حتى في حجم صغير (~44px) */
export function PregnantWomanIcon({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="الحمل">
      <svg viewBox="0 0 120 140" className="size-full">
        <circle cx="60" cy="80" r="52" fill="#DCFCE7" />
        <circle cx="60" cy="35" r="13" fill="#16A34A" />
        <ellipse cx="60" cy="90" rx="24" ry="27" fill="#22C55E" />
        <circle cx="60" cy="93" r="16" fill="#4ADE80" />
      </svg>
    </div>
  );
}
