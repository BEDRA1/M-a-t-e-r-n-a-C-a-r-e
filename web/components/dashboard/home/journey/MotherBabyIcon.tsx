/** أيقونة "النفاس والولادة" — دائرة وردية + مخطط أم تحمل طفلاً، لشريط رحلة الـ1000 يوم */
export function MotherBabyIcon({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="النفاس والولادة">
      <svg viewBox="0 0 40 40" className="size-full">
        <circle cx="20" cy="20" r="20" fill="#FCE4EC" />
        <circle cx="16" cy="11" r="4" fill="#ED4A93" />
        <path
          d="M9 33c0-8.5 2-13.5 7-15.5"
          fill="none"
          stroke="#ED4A93"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M23.5 33c0-7-1-11.5-4-14"
          fill="none"
          stroke="#ED4A93"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="27" cy="21.5" r="3.4" fill="#ED4A93" />
        <path d="M27 25c0 3.5-1 5.5-1 5.5" fill="none" stroke="#ED4A93" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
