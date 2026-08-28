/** أيقونة "النفاس والولادة" — دائرة وردية + رسمة أم تحمل طفلاً بين ذراعيها،
 * بنفس عائلة الأشكال المستخدَمة في PregnantWomanIcon (رأس + جسم + ذراعان) مع طفل صغير مضاف
 * عند الصدر بدل الانتفاخ، ليقرأ بوضوح كـ"أم مع مولودها" */
export function MotherBabyIcon({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="النفاس والولادة">
      <svg viewBox="0 0 120 140" className="size-full">
        <circle cx="60" cy="80" r="52" fill="#FCE4EC" />
        <path d="M40 30c0-14 40-14 40 0v18c-8-6-32-6-40 0Z" fill="#F79FC4" />
        <circle cx="60" cy="34" r="13" fill="#F274AB" />
        <path
          d="M45 48c-10 6-15 19-14 40 1 18 8 32 29 32s28-14 29-32c1-21-4-34-14-40-6 10-24 10-30 0Z"
          fill="#ED4A93"
        />
        <path d="M42 74c-8 4-11 15-9 25" fill="none" stroke="#ED4A93" strokeWidth="7" strokeLinecap="round" />
        <path d="M78 74c8 4 11 15 9 25" fill="none" stroke="#ED4A93" strokeWidth="7" strokeLinecap="round" />
        <circle cx="60" cy="93" r="11" fill="#FCE4EC" />
        <circle cx="60" cy="82" r="7.5" fill="#F79FC4" />
      </svg>
    </div>
  );
}
