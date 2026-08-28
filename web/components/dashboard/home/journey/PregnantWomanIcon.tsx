/** أيقونة "الحمل" — دائرة خضراء فاتحة + مخطط امرأة حامل، لشريط رحلة الـ1000 يوم */
export function PregnantWomanIcon({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="الحمل">
      <svg viewBox="0 0 40 40" className="size-full">
        <circle cx="20" cy="20" r="20" fill="#DCFCE7" />
        <circle cx="20" cy="12" r="4" fill="#16A34A" />
        <path
          d="M12 33c0-6.5 1-10.5 3-12.5a6 6 0 0 0 10 0c2 2 3 6 3 12.5"
          fill="none"
          stroke="#16A34A"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="23.5" r="6.5" fill="#16A34A" />
      </svg>
    </div>
  );
}
