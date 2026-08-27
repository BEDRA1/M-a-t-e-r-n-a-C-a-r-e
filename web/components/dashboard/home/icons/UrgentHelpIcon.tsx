/** أيقونة إنذار أحمر — لبطاقة طلب المساعدة المستعجل */
export function UrgentHelpIcon({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="طلب المساعدة المستعجل">
      <svg viewBox="0 0 100 100" className="size-full">
        <line x1="20" y1="20" x2="28" y2="28" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <line x1="50" y1="12" x2="50" y2="22" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <line x1="80" y1="20" x2="72" y2="28" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <circle cx="50" cy="46" r="20" fill="#FCA5A5" opacity="0.5" />
        <circle cx="50" cy="46" r="14" fill="#EF4444" />
        <path d="M30 60c0-4 4-6 20-6s20 2 20 6v6H30Z" fill="#94A3B8" />
        <rect x="24" y="66" width="52" height="10" rx="4" fill="#64748B" />
      </svg>
    </div>
  );
}
