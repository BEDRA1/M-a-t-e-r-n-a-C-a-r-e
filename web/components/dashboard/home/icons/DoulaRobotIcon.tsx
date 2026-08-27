// روبوت أخضر/فيروزي مخصّص لبطاقة الدولا في الصفحة الرئيسية — منفصل عمدًا عن
// DoulaRobotIllustration البنفسجية المستخدمة داخل صفحة الدولا وشريطي التنقل
export function DoulaRobotIcon({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="الدولا الرقمية">
      <svg viewBox="0 0 100 100" className="size-full">
        <line x1="50" y1="12" x2="50" y2="20" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="9" r="4" fill="#2DD4BF" />
        <rect x="28" y="20" width="44" height="36" rx="12" fill="#2DD4BF" />
        <rect x="36" y="32" width="11" height="13" rx="5.5" fill="white" />
        <rect x="53" y="32" width="11" height="13" rx="5.5" fill="white" />
        <circle cx="41.5" cy="39" r="2.4" fill="#059669" />
        <circle cx="58.5" cy="39" r="2.4" fill="#059669" />
        <rect x="34" y="60" width="32" height="26" rx="10" fill="#6EE7B7" />
        <rect x="16" y="62" width="10" height="18" rx="5" fill="#2DD4BF" />
        <rect x="74" y="62" width="10" height="18" rx="5" fill="#2DD4BF" />
        <rect x="38" y="86" width="9" height="10" rx="4" fill="#10B981" />
        <rect x="53" y="86" width="9" height="10" rx="4" fill="#10B981" />
      </svg>
    </div>
  );
}
