/** رسمة "طبق متوازن" — ثلاثة عناصر متداخلة برفق ترمز لتوازن المجموعات الغذائية */
export function NutritionPlateIllustration({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="طبق غذائي متوازن">
      <div className="relative flex size-full animate-gentle-breathe items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-200/60 to-accent-200/50 blur-[6px]" />
        <svg viewBox="0 0 100 100" className="relative size-[85%]">
          <circle cx="50" cy="50" r="36" fill="var(--surface)" stroke="var(--color-primary-100)" strokeWidth="3" />
          <ellipse cx="38" cy="42" rx="17" ry="13" fill="var(--color-primary-200)" opacity="0.9" />
          <ellipse cx="63" cy="42" rx="17" ry="13" fill="var(--color-accent-200)" opacity="0.9" />
          <ellipse cx="50" cy="63" rx="19" ry="13" fill="var(--color-primary-100)" opacity="0.9" />
          <circle cx="50" cy="50" r="6" fill="var(--color-accent-500)" />
        </svg>
      </div>
    </div>
  );
}
