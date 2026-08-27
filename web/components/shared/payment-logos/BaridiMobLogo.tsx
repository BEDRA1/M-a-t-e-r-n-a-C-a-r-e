/**
 * تعذّر الوصول لشعار BaridiMob الرسمي (baridimob.dz غير قابل للوصول من هذه البيئة، ومصادر
 * الشعارات الخارجية لا توفر رابط استضافة مباشر مستقر) — بديل SVG محاكٍ (هاتف + دائرة دفع)
 * بلون BaridiMob البرتقالي المميز، كما يسمح به الطلب صراحةً عند تعذّر الرابط المباشر.
 */
export function BaridiMobLogo({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="بريدي موب">
      <svg viewBox="0 0 32 32" className="size-full">
        <rect x="8" y="2" width="16" height="28" rx="3.5" fill="#F7941D" />
        <rect x="10.5" y="5.5" width="11" height="18" rx="1" fill="#FFF7EC" />
        <circle cx="16" cy="27" r="1.3" fill="#FFF7EC" />
        <circle cx="16" cy="14.5" r="5" fill="#F7941D" />
        <path d="M13.6 14.5l1.8 1.8 3-3.2" stroke="#FFF7EC" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
