/**
 * تعذّر الوصول لشعار CIB/EDAHABIA الرسمي (poste.dz وcibbank.dz غير قابلين للوصول من هذه
 * البيئة، ومصادر الشعارات الخارجية مثل seeklogo/logowik لا توفر رابط استضافة مباشر مستقر) —
 * بديل SVG محاكٍ للبطاقة البنكية الذهبية كما يسمح به الطلب صراحةً عند تعذّر الرابط المباشر.
 */
export function GoldCardLogo({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="البطاقة الذهبية CIB / EDAHABIA">
      <svg viewBox="0 0 48 32" className="size-full">
        <rect x="1" y="1" width="46" height="30" rx="5" fill="#F5C542" stroke="#C9971F" strokeWidth="1" />
        <rect x="5" y="8" width="9" height="7" rx="1.5" fill="#E2A825" />
        <rect x="5" y="21" width="18" height="2.2" rx="1.1" fill="#C9971F" opacity="0.7" />
        <circle cx="36" cy="16" r="8" fill="#FDE9AE" opacity="0.85" />
        <circle cx="30" cy="16" r="8" fill="#F5C542" opacity="0.9" />
      </svg>
    </div>
  );
}
