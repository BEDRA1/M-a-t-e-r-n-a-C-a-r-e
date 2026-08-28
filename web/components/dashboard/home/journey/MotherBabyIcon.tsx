/** أيقونة "النفاس والولادة" — دائرة وردية + شخصيتان دائريتان منفصلتان (أم أكبر + طفل أصغر
 * بجانبها)، أشكال دائرية بحتة لضمان وضوح "شخصان" كبير وصغير حتى في حجم صغير */
export function MotherBabyIcon({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="النفاس والولادة">
      <svg viewBox="0 0 120 140" className="size-full">
        <circle cx="60" cy="80" r="52" fill="#FCE4EC" />
        <circle cx="45" cy="33" r="12" fill="#ED4A93" />
        <ellipse cx="45" cy="82" rx="20" ry="29" fill="#F274AB" />
        <circle cx="78" cy="66" r="8" fill="#ED4A93" />
        <ellipse cx="78" cy="92" rx="13.5" ry="17" fill="#F274AB" />
      </svg>
    </div>
  );
}
