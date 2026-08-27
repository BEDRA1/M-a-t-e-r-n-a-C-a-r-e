# Materna Care — الموقع (Web) — Phase 1

الواجهة الأمامية لمنصة **Materna Care** مبنية بـ Next.js (App Router) وTypeScript وTailwind CSS، بدعم كامل للغة العربية والاتجاه من اليمين لليسار (RTL).

هذا المستودع يغطي **Phase 1 فقط**: صفحة هبوط، تسجيل/دخول، حاسبة الحمل، المتابعة الأسبوعية، التذكيرات، وربط العائلة. لا يوجد أي API جديد هنا — الموقع يتصل بالـ Backend (NestJS) الموجود في المجلد الجذر للمشروع.

## التقنيات

- Next.js (App Router) + TypeScript
- Tailwind CSS 4 (تهيئة الألوان والخطوط عبر `app/globals.css`)
- TanStack React Query لإدارة بيانات الـ API من جهة العميل
- React Hook Form + Zod للتحقق من صحة النماذج
- خط Cairo عبر `next/font/google`

## البنية المعمارية للمصادقة

التوكنات (access/refresh) تُخزَّن في **httpOnly cookies** فقط، ولا تُقرأ أبدًا من جافاسكريبت في المتصفح:

1. عند تسجيل الدخول/إنشاء الحساب، يستقبل Route Handler الطلب (`app/api/auth/login`, `app/api/auth/register`)، يتصل بالـ Backend الفعلي، ثم يضع التوكنات في cookies آمنة على الاستجابة.
2. أي طلب لاحق من المتصفح (حاسبة الحمل، التذكيرات...) يمر عبر `app/api/backend/[...path]/route.ts` الذي يقرأ access token من الـ cookie، يستدعي الـ Backend، وإن انتهت صلاحية التوكن (401) يجدده تلقائيًا عبر refresh token قبل إعادة المحاولة مرة واحدة.
3. `middleware.ts` يحمي مسارات `/dashboard/*` بالتحقق من وجود cookie صالح، ويحوّل غير المسجّلين إلى صفحة الدخول.

## التشغيل محليًا

يتطلب تشغيل الـ Backend أولًا (راجع README الخاص بالمجلد الجذر) على `http://localhost:3000`.

```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```

الموقع سيعمل على `http://localhost:3001` (أو أول منفذ متاح إن كان 3000 مشغولًا بالـ Backend — تأكدي من ضبط `PORT=3001` عند التشغيل إن لزم: `PORT=3001 npm run dev`).

## متغيرات البيئة (`.env.local`)

| المتغير | الوصف |
|---|---|
| `NEXT_PUBLIC_API_URL` | رابط الـ Backend الفعلي (مثال: `http://localhost:3000/api/v1`) |
| `NEXT_PUBLIC_SITE_URL` | الرابط العلني للموقع، يُستخدم في metadata وsitemap.xml |

## البناء للإنتاج

```bash
npm run build
npm run start
```

## بنية المشروع

```
app/
  page.tsx                     صفحة الهبوط (Server Component، محتوى SEO)
  (auth)/login, (auth)/register
  dashboard/                   لوحة الأم (محمية عبر middleware + تحقق في layout.tsx)
    layout.tsx, page.tsx, pregnancy-calculator/, weekly-tracking/, reminders/, family/
  api/
    auth/{register,login,logout}/route.ts   يضبط httpOnly cookies
    backend/[...path]/route.ts              وسيط عام يجدد التوكن تلقائيًا
components/
  ui/          مكوّنات مشتركة (Button, Input, Card...)
  landing/     مكوّنات صفحة الهبوط
  dashboard/   مكوّنات لوحة الأم
lib/
  api-client.ts       fetch wrapper من جهة العميل
  server/             أدوات خاصة بالسيرفر (cookies, proxy, getCurrentUser)
  hooks/              React Query hooks لكل وحدة
  validation/         مخططات Zod للنماذج
```

## ملاحظة حول تسمية المجلدات

الطلب الأصلي اقترح `(dashboard)` كمجموعة مسارات (route group)، لكن هذا يتعارض مع صفحة الهبوط في `/` لأن مجموعات المسارات لا تضيف جزءًا في الرابط. لذلك استُخدم `app/dashboard/` كمسار حقيقي بدلًا من ذلك (نفس الفكرة: layout مشترك وتجميع منطقي)، بينما بقيت `(auth)` كمجموعة مسارات لأنها لا تسبب أي تعارض.
