# Materna Care API

منصة **أم وأمان** الجزائرية لمرافقة الأم من الحمل حتى سنتين بعد الولادة.

**Phase 1:** المصادقة، ربط الأم بالزوج، وحدة الحمل، والتذكيرات.
**Phase 2:** تقييم الحالة النفسية (5 محاور)، النصائح اليومية، والإشعارات داخل التطبيق.
**Phase 3:** سوق حجز استشارات نفسية ثنائي الجانب — أخصائيون معتمدون، فترات توفر، حجوزات، تقييمات.

## التقنيات

- Node.js + NestJS + TypeScript
- PostgreSQL + Prisma ORM
- JWT (access token 15 دقيقة + refresh token 7 أيام) + bcrypt
- `@nestjs/schedule` لمهمة جدولة تذكيرات المواعيد
- Swagger على `/api/docs`

## التشغيل محليًا عبر Docker (الطريقة الموصى بها)

يتطلب تثبيت Docker و Docker Compose.

```bash
cp .env.example .env
docker compose up --build
```

بعد الإقلاع:
- الـ API على: `http://localhost:3000/api/v1`
- توثيق Swagger على: `http://localhost:3000/api/docs`

لزرع بيانات تجريبية (5 أسابيع محتوى + مستخدم admin):

```bash
docker compose exec api npm run prisma:seed
```

بيانات دخول الـ admin التجريبي بعد الزرع: **الهاتف** `0500000000` — **كلمة المرور** `Admin@12345`

## التشغيل محليًا بدون Docker

يتطلب Node.js 20+ و PostgreSQL يعمل محليًا.

```bash
npm install
cp .env.example .env   # وعدّل DATABASE_URL ليطابق قاعدة بياناتك المحلية
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

## متغيرات البيئة (`.env`)

| المتغير | الوصف |
|---|---|
| `DATABASE_URL` | رابط الاتصال بقاعدة بيانات PostgreSQL |
| `PORT` | منفذ تشغيل الـ API (افتراضي 3000) |
| `JWT_ACCESS_SECRET` | مفتاح تشفير access token |
| `JWT_ACCESS_EXPIRES_IN` | مدة صلاحية access token (افتراضي 15m) |
| `JWT_REFRESH_SECRET` | مفتاح تشفير refresh token |
| `JWT_REFRESH_EXPIRES_IN` | مدة صلاحية refresh token (افتراضي 7d) |

## اللغة في رسائل الأخطاء

كل رسائل الأخطاء تُرسل بالعربية افتراضيًا. لتلقّيها بالإنجليزية أرسل الترويسة:

```
Accept-Language: en
```

## أمثلة curl لأهم الـ endpoints

جميع المسارات تبدأ بالبادئة `/api/v1`.

### 1. تسجيل مستخدم جديد (أم)

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0555123456",
    "password": "StrongP@ss1",
    "role": "mother",
    "wilaya": "الجزائر العاصمة"
  }'
```

### 2. تسجيل الدخول

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "phone": "0555123456", "password": "StrongP@ss1" }'
```

يعيد `accessToken` و `refreshToken`. استخدمي `accessToken` في الترويسة `Authorization: Bearer <token>` لبقية الطلبات.

### 3. تجديد access token

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{ "refreshToken": "<refresh_token>" }'
```

### 4. بيانات المستخدم الحالي

```bash
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <access_token>"
```

### 5. إنشاء كود دعوة للزوج (الأم)

```bash
curl -X POST http://localhost:3000/api/v1/families/invite \
  -H "Authorization: Bearer <mother_access_token>"
```

### 6. انضمام الزوج عبر الكود

```bash
curl -X POST http://localhost:3000/api/v1/families/join \
  -H "Authorization: Bearer <spouse_access_token>" \
  -H "Content-Type: application/json" \
  -d '{ "inviteCode": "A1B2C3" }'
```

### 7. إنشاء حمل جديد (بطريقة LMP)

```bash
curl -X POST http://localhost:3000/api/v1/pregnancy \
  -H "Authorization: Bearer <mother_access_token>" \
  -H "Content-Type: application/json" \
  -d '{ "calcMethod": "lmp", "lmpDate": "2026-05-01" }'
```

### 8. بيانات الحمل النشط الحالي

```bash
curl http://localhost:3000/api/v1/pregnancy/me \
  -H "Authorization: Bearer <access_token>"
```

### 9. إضافة سجل أسبوعي

```bash
curl -X POST http://localhost:3000/api/v1/pregnancy/weekly-logs \
  -H "Authorization: Bearer <mother_access_token>" \
  -H "Content-Type: application/json" \
  -d '{ "weekNumber": 12, "weightKg": 65.5, "symptoms": ["غثيان"], "notes": "تحسّن ملحوظ" }'
```

### 10. محتوى أسبوع معيّن من الحمل

```bash
curl http://localhost:3000/api/v1/pregnancy/week-content/12 \
  -H "Authorization: Bearer <access_token>"
```

### 11. إنشاء تذكير

```bash
curl -X POST http://localhost:3000/api/v1/reminders \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{ "type": "vitamin", "title": "حمض الفوليك", "scheduledTime": "2026-08-10T08:00:00.000Z" }'
```

### 12. قائمة التذكيرات

```bash
curl http://localhost:3000/api/v1/reminders \
  -H "Authorization: Bearer <access_token>"
```

### 13. قائمة محاور التقييم النفسي

```bash
curl http://localhost:3000/api/v1/assessments/domains \
  -H "Authorization: Bearer <access_token>"
```

### 14. أسئلة محور معيّن

```bash
curl http://localhost:3000/api/v1/assessments/domains/<domain_id>/questions \
  -H "Authorization: Bearer <access_token>"
```

### 15. إرسال إجابات محور والحصول على النتيجة فورًا

```bash
curl -X POST http://localhost:3000/api/v1/assessments/submit \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "domainId": "<domain_id>",
    "answers": [
      { "questionId": "<q1_id>", "value": 2 },
      { "questionId": "<q2_id>", "value": 1 },
      { "questionId": "<q3_id>", "value": 0 },
      { "questionId": "<q4_id>", "value": 1 },
      { "questionId": "<q5_id>", "value": 2 }
    ]
  }'
```

يجب الإجابة على **كل** أسئلة المحور (لا يقبل إجابات جزئية). الاستجابة تتضمن `totalScore`، `classification` (`low`/`medium`/`high`)، و`disclaimerText` ثابت يوضّح أن هذا ليس تشخيصًا طبيًا. منطق التصنيف موثّق بالتفصيل في `src/assessments/lib/classify.ts`.

### 16. سجل تقييماتي (بفلتر محور اختياري)

```bash
curl "http://localhost:3000/api/v1/assessments/history?domain=<domain_id>" \
  -H "Authorization: Bearer <access_token>"
```

### 17. نصيحة اليوم

```bash
curl http://localhost:3000/api/v1/daily-tips/today \
  -H "Authorization: Bearer <access_token>"
```

### 18. قائمة إشعاراتي (بفلتر مقروء/غير مقروء اختياري)

```bash
curl "http://localhost:3000/api/v1/notifications?isRead=false" \
  -H "Authorization: Bearer <access_token>"
```

### 19. تعليم إشعار كمقروء / الكل كمقروء

```bash
curl -X PATCH http://localhost:3000/api/v1/notifications/<id>/read \
  -H "Authorization: Bearer <access_token>"

curl -X PATCH http://localhost:3000/api/v1/notifications/read-all \
  -H "Authorization: Bearer <access_token>"
```

## تذكير المواعيد التلقائي (Scheduled Job)

مهمة مجدولة (`src/notifications/appointment-reminder.scheduler.ts`) تعمل كل دقيقة، تفحص كل
تذكير `appointment` (من وحدة `reminders` في Phase 1) غير منجز يقع خلال الـ24 ساعة القادمة،
وتنشئ له إشعار `appointment_reminder` داخل التطبيق — **مرة واحدة فقط لكل تذكير** (idempotent
عبر حقل `sourceReminderId`). هذه آلية منفصلة تمامًا عن حجوزات الاستشارات في Phase 3 أدناه.

## Phase 3 — سوق حجز الاستشارات النفسية (Specialists Marketplace)

### قرار معماري: فترات توفر بتواريخ محددة، لا نمط أسبوعي متكرر

اخترت أن يمثّل كل صف في `specialist_availability` **فترة زمنية حقيقية وحيدة** (`start_time`/
`end_time` كطابع زمني كامل)، وليس نمطًا متكررًا (`day_of_week`). السبب: هذا يسمح بوضع قيد
`UNIQUE` حقيقي على `bookings.availability_slot_id` على مستوى قاعدة البيانات — علاقة 1-إلى-1
تمنع الحجز المزدوج **حتميًا**، حتى لو وصل طلبان في نفس اللحظة تمامًا (تم اختبار هذا فعليًا،
انظر أدناه). مع نمط متكرر، لا يوجد صف فريد يمكن وضع قيد عليه، ويصبح منع التعارض منطقًا
تطبيقيًا أضعف بكثير عرضة لحالات السباق (race conditions).

### الدفع — نطاق Phase 3 هذا فقط نية دفع، وليس بوابة فعلية

الحجز يخزّن `payment_method` (نية الدفع فقط: `card`/`ccp`/`baridimob`/`pay_at_attendance`)
و`payment_status` (`pending`/`paid`/`failed`) يُحدّثها **admin يدويًا** عبر endpoint مخصص.
لا يوجد أي تكامل فعلي مع بوابة دفع جزائرية (Chargily أو غيرها) — هذا Phase منفصل لاحقًا.

### أدوار جديدة ومنطق الموافقة

`specialist` دور جديد يُسجَّل عبر `/auth/register` العادي مثل mother/spouse. بعد التسجيل،
ينشئ الأخصائي ملفه المهني (`POST /specialists/me`) بحالة `pending` — **لا يظهر في القوائم
العامة ولا يمكن حجزه** حتى يوافق admin عليه (`PATCH /specialists/:id/approve`).

### حقل `full_name` في جدول specialists

الاسم الكامل الظاهر للمستخدمين (`fullName`) مخزَّن على `Specialist` نفسه وليس على `User` (الذي
لا يملك حقل اسم أصلًا، فقط phone/email). الحقل **إلزامي عند إنشاء الملف المهني** (`POST
/specialists/me`) واختياري عند التعديل (`PATCH /specialists/me`، مثل باقي الحقول). العمود أُضيف
عبر migration منفصلة (`add_specialist_full_name`) بقيمة مؤقتة `"أخصائي/ة معتمد"` للصفوف
الموجودة مسبقًا قبل فرض القيد `NOT NULL` — الصفوف التجريبية الثلاثة في seed.ts تحصل على أسماء
حقيقية عبر seed، وأي أخصائي حقيقي آخر يحدّث اسمه بنفسه عبر `PATCH /specialists/me`.

### أمثلة curl — الدورة الكاملة

```bash
# 1) تسجيل أخصائي جديد
curl -X POST http://localhost:3000/api/v1/auth/register -H "Content-Type: application/json" \
  -d '{ "phone": "0555000111", "password": "Spec@1234", "role": "specialist" }'

# 2) إنشاء الملف المهني (بحالة pending) — fullName إلزامي عند الإنشاء
curl -X POST http://localhost:3000/api/v1/specialists/me \
  -H "Authorization: Bearer <specialist_access_token>" -H "Content-Type: application/json" \
  -d '{ "fullName": "د. أحلام بن يوسف", "specialty": "القلق أثناء الحمل", "bio": "أخصائية نفسية بخبرة 8 سنوات...", "yearsExperience": 8 }'

# 3) موافقة admin (admin التجريبي: 0500000000 / Admin@12345)
curl -X PATCH http://localhost:3000/api/v1/specialists/<specialist_id>/approve \
  -H "Authorization: Bearer <admin_access_token>"

# 4) الأخصائي يضيف فترة توفر (عن بعد)
curl -X POST http://localhost:3000/api/v1/specialist-availability \
  -H "Authorization: Bearer <specialist_access_token>" -H "Content-Type: application/json" \
  -d '{ "startTime": "2026-08-20T09:00:00.000Z", "endTime": "2026-08-20T10:00:00.000Z", "consultationType": "remote" }'

# 5) الأم تستعرض الفترات المتاحة وأسباب الحجز
curl http://localhost:3000/api/v1/specialist-availability/available -H "Authorization: Bearer <mother_access_token>"
curl http://localhost:3000/api/v1/consultation-reasons -H "Authorization: Bearer <mother_access_token>"

# 6) الأم تحجز
curl -X POST http://localhost:3000/api/v1/bookings \
  -H "Authorization: Bearer <mother_access_token>" -H "Content-Type: application/json" \
  -d '{ "availabilitySlotId": "<slot_id>", "reasonId": "<reason_id>", "paymentMethod": "baridimob" }'

# 7) الأخصائي يؤكد الحجز
curl -X PATCH http://localhost:3000/api/v1/bookings/<booking_id>/status \
  -H "Authorization: Bearer <specialist_access_token>" -H "Content-Type: application/json" \
  -d '{ "status": "confirmed" }'

# 8) الأخصائي يضيف رابط الفيديو (استشارة عن بعد فقط، بعد التأكيد)
curl -X PATCH http://localhost:3000/api/v1/bookings/<booking_id>/video-link \
  -H "Authorization: Bearer <specialist_access_token>" -H "Content-Type: application/json" \
  -d '{ "videoLink": "https://meet.google.com/abc-defg-hij" }'

# 9) الأخصائي يعلّم الاستشارة كمكتملة
curl -X PATCH http://localhost:3000/api/v1/bookings/<booking_id>/status \
  -H "Authorization: Bearer <specialist_access_token>" -H "Content-Type: application/json" \
  -d '{ "status": "completed" }'

# 10) الأم تقيّم
curl -X POST http://localhost:3000/api/v1/booking-reviews \
  -H "Authorization: Bearer <mother_access_token>" -H "Content-Type: application/json" \
  -d '{ "bookingId": "<booking_id>", "rating": 5, "comment": "جلسة ممتازة" }'

# 11) admin يحدّث حالة الدفع يدويًا
curl -X PATCH http://localhost:3000/api/v1/bookings/<booking_id>/payment-status \
  -H "Authorization: Bearer <admin_access_token>" -H "Content-Type: application/json" \
  -d '{ "paymentStatus": "paid" }'

# إلغاء حجز (لصاحبه أو الأخصائي أو admin) — يحرّر الفترة تلقائيًا لتظهر في available من جديد
curl -X POST http://localhost:3000/api/v1/bookings/<booking_id>/cancel -H "Authorization: Bearer <token>"
```

**تحقق فعلي من منع الحجز المزدوج (وليس افتراضًا):** أُطلق طلبا حجز لنفس الفترة في نفس
اللحظة تمامًا (`&` + `wait` في bash، لا تسلسل)، والنتيجة: طلب واحد نجح (`201`) والآخر
رُفض حتمًا (`409 — هذه الفترة محجوزة بالفعل`) بسبب قيد `UNIQUE` على `bookings.availability_slot_id`.

## Phase 5 — الاشتراكات والدفع (محاكاة واقعية)

### 5 باقات ثابتة (مزروعة عبر seed، الكود ثابت ولا يُنشأ عبر API)

| الكود | السعر | النوع | booking_credits | course_credits | unlimited |
|---|---|---|---|---|---|
| basic | 2500 دج | monthly | 0 | 0 | لا |
| premium | 5000 دج | monthly | 1 | 1 | لا |
| royal | 16000 دج | monthly | 999 | 999 | **نعم** |
| postpartum | 6000 دج | one_time | 0 | 0 | لا |
| couples | 4000 دج | one_time | 1 | 0 | لا |

### طبقة الدفع — محاكاة، جاهزة للاستبدال بـChargily

`src/payments/payment.provider.ts` يعرّف `PaymentProvider` interface فقط (لا منطق).
`SimulatedPaymentProvider` (نفس المجلد) يطبّقه بمحاكاة واقعية:
- Visa: تحقق 16 رقمًا + تاريخ صلاحية مستقبلي + CVV 3-4 أرقام، ثم تأخير 2 ثانية (محاكاة معالجة بنكية)، `cardNumber` يبدأ بـ`0000` → فشل متعمّد لاختبار حالات الرفض.
- BaridiMob: تحقق رقم هاتف جزائري (10 أرقام يبدأ بـ0) + رمز تحقق 6 أرقام، تأخير 1.5 ثانية، `phoneNumber` ينتهي بـ`0000` → فشل متعمّد.

الاستبدال بـChargily لاحقًا: أنشئي `ChargilyPaymentProvider implements PaymentProvider`، وغيّري `useClass`
في `src/payments/payments.module.ts` فقط — لا تغيير في `subscriptions` module أو أي كود آخر.

### تعارض أسماء enum — قرار معماري متعمّد

الـschema الأصلي لهذه المرحلة اقترح `PaymentMethod {visa, baridimob}` و`PaymentStatus {pending,
succeeded, failed}` لجدول `subscription_transactions` — لكن هذين الاسمين مُستخدَمان بالفعل بقيم
مختلفة تمامًا في حجوزات الاستشارات (`PaymentMethod {card, ccp, baridimob, pay_at_attendance}`،
`PaymentStatus {pending, paid, failed}`). بدل المخاطرة بكسر كود الحجوزات المُختبر، سُمّي enum
الاشتراكات الجديدان `SubscriptionPaymentMethod` و`TransactionStatus`. أما `PaymentStatus` الأصلي
فأُضيفت له قيمة واحدة فقط بأمان: `free_with_subscription` — تُستخدم عندما يُحجز عبر رصيد اشتراك.

### الحجز المجاني عبر الاشتراك (credits)

عند `POST /bookings`، تُفحص اشتراكات المستخدم النشطة تلقائيًا (لا حقل إضافي في الطلب):
- إن وُجد اشتراك بـ`unlimitedBookings = true` (royal فقط) → الحجز مجاني فورًا، بلا خصم رصيد،
  فقط تحقق من أن الاشتراك نشط.
- وإلا إن وُجد اشتراك برصيد `bookingCreditsRemaining > 0` → خصم حتمي (١) داخل نفس الـtransaction
  التي تُنشئ الحجز (`updateMany` بشرط `gt: 0`، بنفس فلسفة منع الحجز المزدوج — لا سباق ممكن حتى مع
  طلبين متزامنين).
- وإلا → التدفق العادي كما كان قبل هذه المرحلة تمامًا (`paymentMethod`/`paymentStatus: pending`).

في الحالتين الأوليين: `paymentStatus: free_with_subscription`، `paymentMethod: null`.

### `course_credits` — عدّاد محسوب فقط، بلا endpoint استهلاك

لا يوجد موديول courses في المشروع أصلًا (ولا في أي مرحلة سابقة رغم إشارة أولية خاطئة لوجوده).
`courseCreditsRemaining` يُخزَّن ويُعرض في `GET /subscriptions/mine` لكن لا يُستهلك حاليًا من أي
مكان — جاهز للربط الفعلي عند بناء موديول الدورات لاحقًا.

### أمثلة curl

```bash
# 1) قائمة الباقات (لا تتطلب دورًا معينًا، فقط تسجيل دخول)
curl http://localhost:3000/api/v1/subscriptions/plans -H "Authorization: Bearer <token>"

# 2) الاشتراك (محاكاة Visa)
curl -X POST http://localhost:3000/api/v1/subscriptions/subscribe \
  -H "Authorization: Bearer <mother_access_token>" -H "Content-Type: application/json" \
  -d '{ "planCode": "premium", "paymentMethod": "visa",
        "paymentData": { "cardNumber": "4111111111111111", "expiryMonth": "12", "expiryYear": "2030", "cvv": "123", "holderName": "Amina B." } }'

# 3) اختبار فشل الدفع عمدًا (Visa)
curl -X POST http://localhost:3000/api/v1/subscriptions/subscribe \
  -H "Authorization: Bearer <mother_access_token>" -H "Content-Type: application/json" \
  -d '{ "planCode": "premium", "paymentMethod": "visa",
        "paymentData": { "cardNumber": "0000111122223333", "expiryMonth": "12", "expiryYear": "2030", "cvv": "123", "holderName": "X" } }'
# → 402 { "message": "تم رفض الدفع" }

# 4) اشتراكاتي
curl http://localhost:3000/api/v1/subscriptions/mine -H "Authorization: Bearer <mother_access_token>"

# 5) حجز استشارة — يُخصَم credit تلقائيًا إن وُجد اشتراك نشط
curl -X POST http://localhost:3000/api/v1/bookings \
  -H "Authorization: Bearer <mother_access_token>" -H "Content-Type: application/json" \
  -d '{ "availabilitySlotId": "<slot_id>", "reasonId": "<reason_id>" }'
# → paymentStatus: "free_with_subscription" إن وُجد رصيد، وإلا التدفق العادي

# 6) إلغاء اشتراك
curl -X POST http://localhost:3000/api/v1/subscriptions/<subscription_id>/cancel \
  -H "Authorization: Bearer <mother_access_token>"
```

**تحقق فعلي (وليس افتراضًا):** اختُبرت كل الحالات أعلاه فعليًا عبر curl، بما فيها: نجاح/فشل Visa
وBaridiMob، خصم credit حقيقي بعد الحجز (تحقّق `bookingCreditsRemaining` قبل وبعد)، عودة التدفق
العادي تلقائيًا بعد نفاد الرصيد، عدم خصم أي رصيد مع royal (unlimited)، منع الاشتراك لدور specialist
(`403`)، ورفض كود باقة غير موجود (`404`).

## وحدة النفاس وملف الطفل (Postpartum & Baby)

> ملاحظة ترقيم: طُلبت هذه الوحدة باسم "Phase 3"، لكن README يحتوي بالفعل على قسم "Phase 3" مختلف
> تمامًا (سوق الاستشارات أعلاه). أبقيت عنوان ذلك القسم كما هو ووثّقت هذه الوحدة بعنوان وصفي منفصل
> بدل استخدام رقم متعارض — التسلسل الفعلي للتنفيذ داخل هذا الملف: Auth/Family/Pregnancy/Reminders
> → Assessments/Tips/Notifications → Specialists/Bookings → Subscriptions/Payments → (هذه الوحدة).

### الربط التلقائي مع الحمل — قرار مهم

لا يوجد حقل مدة صريح لكل باقة/حمل يُحدَّد "متى تنتهي فترة النفاس بالضبط" في أي مكان بالمشروع،
لذا `birthDate` أصبح حقلًا **إلزاميًا فقط عند** `PATCH /pregnancy` بـ`status: "completed"`
(وإلا `400`) — وعند توفره، يُنشأ `postpartum_period` تلقائيًا **في نفس الـtransaction** بربط
1-إلى-1 حقيقي مع الحمل (`pregnancyId @unique`)، فلا يمكن اكتمال حمل دون فترة نفاس مرتبطة، ولا
يمكن أبدًا إنشاء أكثر من فترة نفاس واحدة لنفس الحمل.

`day_count` يُحسب ديناميكيًا في كل قراءة (لا عمود مخزَّن): الفرق بالأيام بين الآن و`birthDate`
مضافًا إليه يوم واحد (يوم الولادة نفسه = اليوم الأول)، بحد أقصى 40.

### مزامنة التذكيرات مع فحوصات الطفل — قاعدة عامة لا حالة واحدة فقط

الطلب الأصلي وصف حالة واحدة ("عند تحديث scheduledDate → reminder يُحدَّث"). عمّمتها إلى قاعدة
متسقة تغطي كل الحالات المنطقية عند إنشاء/تعديل فحص:
- يجب أن يكون للفحص تذكير **حصرًا إن** كان `scheduledDate` (بعد أي تعديل) في المستقبل.
- كان له تذكير ويجب أن يبقى → **تحديث** نفس التذكير (لا حذف/إعادة إنشاء).
- لم يكن له تذكير ويجب أن يُصبح له (مثلًا فحص كان بتاريخ ماضٍ ثم عُدِّل لتاريخ مستقبلي) → **إنشاء** تذكير جديد.
- كان له تذكير ولم يعد يستحقه (تعديل التاريخ إلى الماضي) → **حذف** التذكير وتصفير `linkedReminderId`.

الإنشاء/التحديث/الحذف كلها تمر عبر `RemindersService` الموجود فعليًا (لا استدعاء Prisma مباشر لجدول
reminders من وحدة الأطفال) — تمامًا كما طُلب. حذف فحص يحذف تذكيره المرتبط إن وُجد. **حذف طفل بأكمله
لا يُنظّف تذكيرات فحوصاته تلقائيًا حاليًا** (خارج النطاق المطلوب صراحةً، الذي حدّد المزامنة عند
تحديث/حذف فحص بعينه فقط) — فجوة معروفة موثّقة هنا عمدًا.

### أمثلة curl

```bash
# 1) إنهاء الحمل بتاريخ ولادة فعلي → ينشئ postpartum_period تلقائيًا
curl -X PATCH http://localhost:3000/api/v1/pregnancy \
  -H "Authorization: Bearer <mother_access_token>" -H "Content-Type: application/json" \
  -d '{ "status": "completed", "birthDate": "2026-08-04T00:00:00.000Z" }'

# 2) فترة النفاس الحالية + عدّاد الأيام
curl http://localhost:3000/api/v1/postpartum/current -H "Authorization: Bearer <mother_access_token>"

# 3) تسجيل الحالة المزاجية اليومية
curl -X POST http://localhost:3000/api/v1/postpartum/mood-logs \
  -H "Authorization: Bearer <mother_access_token>" -H "Content-Type: application/json" \
  -d '{ "moodLevel": 4, "notes": "يوم جيد" }'

# 4) بيانات الرسم البياني لآخر 7/14/30 يومًا
curl "http://localhost:3000/api/v1/postpartum/mood-logs?days=7" -H "Authorization: Bearer <mother_access_token>"

# 5) إضافة طفل (يتطلب عائلة موجودة — POST /families/invite أولًا إن لم توجد)
curl -X POST http://localhost:3000/api/v1/babies \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "fullName": "ياسين", "birthDate": "2026-08-04T00:00:00.000Z", "gender": "male", "weightGrams": 3200, "heightCm": 50 }'

# 6) إضافة فحص بموعد مستقبلي → ينشئ تذكيرًا تلقائيًا
curl -X POST http://localhost:3000/api/v1/babies/<baby_id>/checkups \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "title": "فحص الشهر الأول", "scheduledDate": "2026-08-19T09:00:00.000Z" }'

# 7) تعديل موعد الفحص → التذكير المرتبط يُحدَّث بنفس معرّفه
curl -X PATCH http://localhost:3000/api/v1/babies/<baby_id>/checkups/<checkup_id> \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "scheduledDate": "2026-08-24T10:30:00.000Z" }'

# 8) حذف الفحص → التذكير المرتبط يُحذف تلقائيًا
curl -X DELETE http://localhost:3000/api/v1/babies/<baby_id>/checkups/<checkup_id> \
  -H "Authorization: Bearer <token>"
```

**تحقق فعلي (وليس افتراضًا):** دورة كاملة اختُبرت عبر curl حي: إنشاء حمل → رفض إكماله بدون
`birthDate` (`400`) → إكماله بـ`birthDate` فعلي → `postpartum_period` ظهر تلقائيًا بـ`dayCount`
صحيح مطابق للحساب اليدوي → رفض `moodLevel: 6` (`400`) → تسجيل مزاجي ناجح → إضافة طفل → فحص
بموعد مستقبلي أنشأ تذكيرًا حقيقيًا (تحقّقت من ظهوره في `GET /reminders`) → تحديث الموعد حدّث نفس
التذكير (نفس الـid، وقت جديد) → حذف الفحص حذف التذكير معه (`GET /reminders` رجعت فارغة) → اختُبرت
أيضًا حالتا الحافة: فحص بتاريخ ماضٍ لا يُنشئ تذكيرًا، وتحديثه لاحقًا إلى تاريخ مستقبلي يُنشئ تذكيرًا
عندئذٍ. كل مسارات auth/pregnancy/bookings/subscriptions/specialists/reminders السابقة أُعيد
اختبارها (`200`) للتأكد من عدم كسر شيء.

## Phase 2C — الدورات التكوينية (Courses & Enrollments)

### إعادة استخدام enum موجود بدل تكراره

نوع الدورة (`in_person`/`remote`) يطابق تمامًا `ConsultationType` الموجود مسبقًا للاستشارات
(نفس القيم بالحرف)، فأعدت استخدامه على `Course.type` بدل إنشاء enum مطابق جديد — على عكس حالة
`PaymentMethod`/`PaymentStatus` في Phase 5 حيث اختلفت القيم فعليًا واستوجب الأمر enum منفصل.

### `durationDays` إلى جانب `durationText` — لماذا حقلان لا حقل واحد

الطلب حدّد "مدة نصية" للعرض (`durationText`, مثل "3 أسابيع") **و**طلب أيضًا بوابة شهادة تتحقق من
"تاريخ البدء + المدة مضى" — نص حر لا يمكن حسابه برمجيًا. أضفت `durationDays` (رقم صحيح) خصيصًا
لحساب موعد الاكتمال الفعلي (`startDate + durationDays`)، بينما يبقى `durationText` للعرض فقط كما
طُلب حرفيًا. كلاهما إلزاميان عند الإنشاء.

### فحص السعة تحت التزامن — نفس فلسفة bookings بآلية مختلفة بالضرورة

فترات توفر الأخصائيين سعتها 1 دائمًا، فاستُخدم قيد `UNIQUE` بسيط. سعة الدورة عادة > 1، فلا يوجد
مورد "وحيد" لوضع UNIQUE عليه مباشرة. الحل: عمود `enrolledCount` يُحدَّث **ذريًا** داخل نفس
الـtransaction عبر `updateMany({ where: { enrolledCount: { lt: capacity } }, data: { increment: 1 } })`
— تحديث SQL شرطي واحد يقفل الصف حتى الـcommit، فطلبان متزامنان على المقعد الأخير يُنفَّذان
بالتتابع حتمًا على مستوى قاعدة البيانات لا التطبيق. **اختُبر فعليًا** بطلبين حقيقيين متزامنين
(`&` + `wait` في bash، لا تسلسل) على دورة سعتها 1: واحد نجح (`201`)، الآخر رُفض حتمًا
(`409`)، و`enrolledCount` بقي **1** بالضبط بعد الاختبار (لا ازدواج عدّ).

الدورات عن بُعد (`capacity: null`) تتخطى هذا الشرط بالكامل — تسجيل غير محدود.

### تكامل course_credits — نفس فلسفة booking credits بفارق واحد مقصود

نفس نمط `bookings.service.ts`: قراءة اشتراك مرشّح خارج الـtransaction، ثم خصم ذري حقيقي
(`updateMany` بشرط `gt: 0`) داخلها. **الفارق المتعمّد**: لا يوجد "unlimitedCourses" في
`SubscriptionPlan` (فقط `unlimitedBookings` لخاصية الحجوزات) — حتى باقة royal (999 course
credit) تُخصَم رقميًا مثل أي باقة أخرى، لا استثناء "غير محدود" لها هنا، لأن الطلب حصر الشرط في
"عنده course_credits > 0" دون ذكر استثناء unlimited للدورات.

### قرارات نطاق أخرى

- **لا منطق دفع فعلي لتسجيل غير مجاني**: الطلب لم يذكر أي حقل/مسار دفع لـ`CourseEnrollment` (لا
  paymentMethod ولا paymentStatus)، فالتسجيل بدون رصيد يُنشأ ببساطة بـ`isFree: false` دون أي
  معالجة دفع — يبقى خارج النطاق حتى يُطلب صراحة.
- **إصدار الشهادة**: قصرته على الأخصائي مالك الدورة فقط (لم يُحدَّد صراحةً)، بما يطابق نمط
  الصلاحيات القائم على الملكية المستخدم في كل مكان آخر بالمشروع (`GET /courses/:id/enrollments`
  مثلًا).
- **قيد فريد إضافي** `@@unique([courseId, userId])` على `course_enrollments` لمنع التسجيل
  المزدوج لنفس المستخدم في نفس الدورة — لم يُطلب صراحةً لكنه سلامة بيانات أساسية بلا تكلفة.

### أمثلة curl

```bash
# 1) إنشاء دورة حضورية بسعة محدودة (أخصائي معتمد فقط)
curl -X POST http://localhost:3000/api/v1/courses \
  -H "Authorization: Bearer <specialist_access_token>" -H "Content-Type: application/json" \
  -d '{ "title": "دورة التحضير للولادة", "description": "...", "type": "in_person",
        "capacity": 20, "startDate": "2026-09-15T09:00:00.000Z", "durationText": "3 أسابيع",
        "durationDays": 21, "price": 8000, "wilaya": "الجزائر العاصمة" }'

# 2) قائمة الدورات (فلترة اختيارية)
curl "http://localhost:3000/api/v1/courses?type=remote&upcoming=true" -H "Authorization: Bearer <token>"

# 3) التسجيل — خصم تلقائي إن وُجد course credit، وإلا تسجيل عادي
curl -X POST http://localhost:3000/api/v1/courses/<course_id>/enroll -H "Authorization: Bearer <mother_access_token>"

# 4) دوراتي
curl http://localhost:3000/api/v1/enrollments/mine -H "Authorization: Bearer <token>"

# 5) قائمة المسجلين (المالك الأخصائي فقط)
curl http://localhost:3000/api/v1/courses/<course_id>/enrollments -H "Authorization: Bearer <specialist_access_token>"

# 6) إصدار شهادة بعد اكتمال الدورة (المالك فقط)
curl -X POST http://localhost:3000/api/v1/courses/<course_id>/enrollments/<enrollment_id>/certificate \
  -H "Authorization: Bearer <specialist_access_token>"
```

**تحقق فعلي (وليس افتراضًا):** دورة حضورية سعة 2 → تسجيل مستخدمين اثنين نجح → ثالث رُفض (`409`).
دورة سعة 1 → طلبان متزامنان حقيقيان (لا تسلسل) → واحد فقط نجح، `enrolledCount` بقي 1 بالضبط.
دورة عن بُعد بلا سعة → 5 تسجيلات نجحت جميعًا. مستخدم باشتراك royal نشط وcourse credit متبقٍ →
تسجيل بـ`isFree: true` تلقائيًا + الرصيد نقص فعليًا (999 → 998، تحقّقت عبر `GET /subscriptions/mine`
قبل وبعد). شهادة رُفضت قبل الاكتمال (`400`)، صدرت بعده (`201`)، ورُفض إصدارها مكرَّرًا (`409`).
كل مسارات auth/pregnancy/bookings/subscriptions/specialists/reminders/postpartum/babies السابقة
أُعيد اختبارها (`200`، عدا `pregnancy/me` وهي `404` صحيحة لعدم وجود حمل نشط حاليًا لحساب الاختبار).

## Phase 4 — التغذية والخدمات المنزلية (Nutrition & Home Services)

### الثقة صفر في سعر العميل — قاعدة صارمة واحدة

`CreateMealOrderDto` لا يحتوي أي حقل سعر حقيقي — فقط `mealId` و`quantity` لكل عنصر. أضفت حقل
`totalPrice` **اختياريًا** بالاسم نفسه فقط لتفادي رفض `whitelist` العام (`forbidNonWhitelisted: true`)
لأي عميل يرسله خطأً أو عمدًا — **`NutritionService` لا يقرأ هذا الحقل في أي سطر بالكود إطلاقًا**.
السعر الإجمالي ولكل عنصر (`unitPrice`) يُحسبان حصرًا من سعر الوجبة الحالي في قاعدة البيانات وقت
الطلب. **اختُبر فعليًا**: طلب بـ`totalPrice: 1` مُرسل من العميل عمدًا → نجح (`201`) والسعر الفعلي
المخزَّن هو سعر الوجبة الحقيقي (400 دج)، لا الرقم المزيّف الذي أُرسل ولا رفض للطلب بالكامل.

### `unitPrice` لقطة (snapshot) لا مرجع حي

`MealOrderItem.unitPrice` يُخزَّن وقت الطلب بدل الاعتماد على `WeeklyMeal.price` وقت القراءة — إن
تغيّر سعر الوجبة لاحقًا (قائمة أسبوع جديد)، تبقى الطلبات القديمة بسعرها الأصلي كما دُفع فعليًا،
وهذا ضروري لسلامة السجلات المالية ولا يمكن الاستغناء عنه.

### `weekStartDate` = الأحد 00:00 UTC — قرار تعسّفي موثّق

الطلب حدّد `dayOfWeek` بترميز 0-6 دون تحديد أي يوم يبدأ الأسبوع، ولا يوجد سياق ثقافي حاسم (نهاية
الأسبوع الجزائرية جمعة-سبت لكن هذا لا يحدد "بداية" الأسبوع فعليًا). اخترت الأحد (`Date.getDay() === 0`)
لأنه يطابق ترميز dayOfWeek المطلوب حرفيًا (0 = أول يوم) دون أي تفسير ثقافي إضافي — قرار تقني بسيط
ومتسق، لا معياري. `GET /weekly-meals/current-week` وseed.ts يحسبان "الأحد الحالي" بنفس المنطق
تمامًا حتى تظهر الوجبات المزروعة فورًا دون أي إعداد إضافي.

### مزامنة الحالة — نفس نمط bookings.service.ts بالحرف

كل من `MealOrder.status` و`ServiceBooking.status` يستخدمان نفس بنية `allowedTransitions: Record<Status, Status[]>`
الموجودة مسبقًا في `bookings.service.ts` حرفيًا (نُسخت كنمط، لا كاستيراد مشترك — يطابق أسلوب
التكرار المتعمّد المستخدم في كل مكان آخر بالمشروع بدل استخراج util مشترك). "إلغاء" مقصور على
pending/confirmed في كلتا الوحدتين، مطابقةً لقاعدة meal-orders الصريحة وتعميمها على home-services
رغم عدم ذكرها هناك حرفيًا (نفس المنطق، خارج النطاق أن يكون مختلفًا بلا سبب).

### أمثلة curl

```bash
# 1) وجبات الأسبوع الحالي
curl http://localhost:3000/api/v1/weekly-meals/current-week -H "Authorization: Bearer <token>"

# 2) طلب وجبات (السعر يُحسب من الخادم دومًا، حتى لو أرسل العميل سعرًا آخر)
curl -X POST http://localhost:3000/api/v1/meal-orders \
  -H "Authorization: Bearer <mother_access_token>" -H "Content-Type: application/json" \
  -d '{ "items": [{ "mealId": "<meal_id>", "quantity": 2 }], "deliveryAddress": "...", "preferredTime": "2026-08-15T12:30:00.000Z" }'

# 3) تحديث حالة الطلب (admin فقط)
curl -X PATCH http://localhost:3000/api/v1/meal-orders/<order_id>/status \
  -H "Authorization: Bearer <admin_access_token>" -H "Content-Type: application/json" -d '{ "status": "confirmed" }'

# 4) كتالوج الخدمات المنزلية
curl "http://localhost:3000/api/v1/home-services?category=تنظيف" -H "Authorization: Bearer <token>"

# 5) حجز خدمة منزلية
curl -X POST http://localhost:3000/api/v1/service-bookings \
  -H "Authorization: Bearer <mother_access_token>" -H "Content-Type: application/json" \
  -d '{ "serviceId": "<service_id>", "scheduledTime": "2026-08-20T10:00:00.000Z", "address": "..." }'
```

**تحقق فعلي (وليس افتراضًا):** طلب بـ3 أصناف بكميات مختلفة (2+1+3) → `totalPrice: 2200` مطابق
تمامًا للحساب اليدوي. `totalPrice` مزيّف من العميل → تجاهله كليًا واحتُسب السعر الحقيقي (400 بدل 1
المُرسل). `mealId` غير موجود (UUID صالح الصيغة) → `404`. تحديث الحالة كمستخدم عادي → `403`، كـadmin
→ `200`، تتابع pending→confirmed→out_for_delivery→delivered كامل، ثم انتقال عكسي غير مسموح →
`400`. إلغاء طلب `delivered` → `400` مرفوض. حجز خدمة منزلية → إلغاؤه → نجح. إعادة اختبار شاملة
لكل الوحدات السابقة (auth/bookings/subscriptions/specialists/reminders/postpartum/babies/courses)
→ `200` بلا استثناء.

## Phase 6 — المتجر الإلكتروني (Products & Product Orders) — آخر وحدة Backend

هذه آخر وحدة backend في المشروع. تعيد استخدام كل الأنماط المُرسّخة في المراحل السابقة حرفيًا بدل
اختراع أنماط جديدة:

- **نفس نمط `total_price`/`unit_price` من meal-orders بالحرف**: `CreateProductOrderDto` لا يحتوي
  حقل سعر حقيقي، فقط `productId`+`quantity` لكل عنصر. حقل `totalPrice` اختياري موجود فقط لتفادي
  رفض `whitelist` العام، و`StoreService` لا يقرأه إطلاقًا. `ProductOrderItem.unitPrice` لقطة
  (snapshot) من سعر المنتج وقت الطلب، لا مرجع حي.
- **نفس فلسفة سعة الدورات من Phase 2C، مطبَّقة على المخزون بدل السعة**: خصم `stockQuantity` ذري
  لكل عنصر عبر `updateMany({ where: { stockQuantity: { gte: quantity } }, data: { decrement } })`
  داخل نفس الـtransaction — تحديث SQL شرطي يقفل الصف حتى الـcommit، فطلبان متزامنان على آخر قطعة
  يُنفَّذان بالتتابع حتمًا على مستوى قاعدة البيانات. **الفارق عن الدورات**: هنا عناصر متعددة في
  الطلب الواحد، فأي عنصر يفشل (chronologically حتى لو لم يكن الأول) يُسقط المعاملة **كاملة** —
  اختُبر فعليًا أن عنصرًا أول ناجحًا لا يُخصَم من مخزونه إطلاقًا إن فشل عنصر ثانٍ بعده في نفس الطلب.
- **استعادة المخزون عند الإلغاء — نفس بنية `releaseSlotAndCancel` في `bookings.service.ts`**:
  دالة خاصة واحدة (`restoreStockAndCancel`) يشترك فيها مساران: إلغاء المالك الصريح (`POST .../cancel`)
  **و**تحديث الحالة إلى `cancelled` من طرف admin عبر `PATCH .../status` — كلاهما يُعيدان الكمية
  ذريًا لكل عنصر في نفس الـtransaction قبل تغيير الحالة، مطابقةً تمامًا لتعامل bookings مع تحرير
  فترة التوفر عند الإلغاء من أي من المسارين.
- **دورة الحالة**: `pending → confirmed → shipped → delivered`، مع `cancelled` من `pending`/`confirmed`
  فقط (الطلبات المشحونة لا تُلغى — نفس قاعدة meal-orders، مطبَّقة هنا بالاسم الحرفي الذي حدّده الطلب:
  "shipped" بدل "out_for_delivery").

### أمثلة curl

```bash
# 1) كتالوج المنتجات (فلترة اختيارية بالفئة أو التوفر)
curl "http://localhost:3000/api/v1/products?category=عناية بالأم&in_stock=true" -H "Authorization: Bearer <token>"

# 2) طلب منتجات — السعر والمخزون يُحسبان/يُخصَمان من الخادم حصرًا
curl -X POST http://localhost:3000/api/v1/product-orders \
  -H "Authorization: Bearer <mother_access_token>" -H "Content-Type: application/json" \
  -d '{ "items": [{ "productId": "<id>", "quantity": 2 }], "deliveryAddress": "..." }'

# 3) تحديث حالة الطلب (admin فقط)
curl -X PATCH http://localhost:3000/api/v1/product-orders/<order_id>/status \
  -H "Authorization: Bearer <admin_access_token>" -H "Content-Type: application/json" -d '{ "status": "confirmed" }'

# 4) إلغاء طلب (المالك، pending/confirmed فقط) — يُعيد المخزون تلقائيًا
curl -X POST http://localhost:3000/api/v1/product-orders/<order_id>/cancel -H "Authorization: Bearer <mother_access_token>"
```

**تحقق فعلي (وليس افتراضًا):** طلب بـ3 منتجات بكميات مختلفة (2+3+5) → `totalPrice: 9450` مطابق
تمامًا للحساب اليدوي، والمخزون نقص بنفس الكميات الثلاث بالضبط. `totalPrice` مزيّف (1) من العميل →
تجاهله كليًا، السعر الحقيقي (1800) هو المحتسب. طلب بمنتجين أحدهما يتجاوز مخزونه ضمن نفس الطلب →
`409` **والمنتج الأول (الذي كان سينجح لوحده) لم يُخصَم من مخزونه إطلاقًا** — تحقّقت من قيمة
`stockQuantity` قبل وبعد المحاولة الفاشلة، بقيت كما هي بالضبط. **تزامن حقيقي** (لا تسلسل) على
منتج مخزونه 1 بالضبط → طلب واحد نجح (`201`)، الآخر رُفض (`409`)، والمخزون أصبح `0` بالضبط لا
سالبًا. إلغاء طلب `pending` → المخزون عاد فعليًا لقيمته الأصلية لكل عنصر (تحقّقت قبل/بعد). محاولة
إلغاء طلب `shipped` (بعد تدرّجه عبر admin) → `400` مرفوض بوضوح ("الطلبات المشحونة لا تُلغى").
إعادة اختبار شاملة لكل الوحدات الـ16 السابقة في المشروع (auth/families/pregnancy/reminders/
assessments/daily-tips/notifications/specialists/specialist-availability/consultation-reasons/
bookings/booking-reviews/subscriptions/postpartum/babies/courses/weekly-meals/meal-orders/
home-services/service-bookings) → `200` بلا استثناء واحد.

## نطاق Phase 1 + Phase 2 + Phase 2C + Phase 3 + Phase 4 + Phase 5 + Phase 6 + النفاس/الطفل

**مُنجز:**
- Phase 1: Auth كامل، ربط الأم بالزوج، وحدة الحمل (حاسبة + سجلات أسبوعية + محتوى أسبوعي)، تذكيرات CRUD.
- Phase 2: تقييم نفسي ذاتي (5 محاور × 5 أسئلة، تصنيف تلقائي، سجل تاريخي)، نصيحة يومية متجددة، إشعارات داخل التطبيق + تذكير تلقائي بالمواعيد القريبة.
- Phase 2C: الدورات التكوينية — إنشاء وإدارة من الأخصائي، تسجيل بمنع تجاوز سعة حتمي تحت التزامن الحقيقي، خصم course_credits تلقائي من الاشتراك النشط، وإصدار شهادات بعد الاكتمال الفعلي.
- Phase 3: دور specialist + ملفات مهنية بموافقة admin، فترات توفر بمنع تعارض حتمي على مستوى قاعدة البيانات، حجوزات كاملة (إنشاء → تأكيد → رابط فيديو → اكتمال/إلغاء)، تقييمات، ونية دفع (بدون بوابة فعلية).
- Phase 4: التغذية (قائمة وجبات أسبوعية + طلبات بسعر محسوب من الخادم حصرًا مع لقطة سعر لكل عنصر) والخدمات المنزلية (كتالوج + حجوزات)، كلاهما بدورة حالة كاملة تُدار عبر admin ويملك صاحب الطلب/الحجز حق الإلغاء المقيّد.
- Phase 5: 5 باقات اشتراك ثابتة، طبقة دفع محاكاة (Visa/BaridiMob) جاهزة لاستبدالها بـChargily، خصم credits تلقائي حقيقي عند الحجز، دعم royal (استشارات غير محدودة).
- Phase 6 (آخر وحدة backend): المتجر الإلكتروني — كتالوج منتجات، طلبات بسعر محسوب من الخادم حصرًا، خصم مخزون ذري حقيقي تحت التزامن مع تراجع كامل عن الطلب بأكمله عند فشل أي عنصر، واستعادة المخزون تلقائيًا عند الإلغاء من المالك أو admin.
- النفاس وملف الطفل: postpartum_period تلقائي عند اكتمال الحمل، عدّاد أيام ديناميكي (حد 40)، سجل مزاج يومي، CRUD كامل للأطفال والفحوصات، مزامنة تلقائية كاملة (إنشاء/تحديث/حذف) بين الفحوصات وتذكيرات RemindersService الموجود.

**غير مُنجز عمدًا (لا مراحل backend متبقية — هذه أمور تكامل خارجي أو مراحل منفصلة تمامًا):**
معالجة دفع فعلية لتسجيلات الدورات وطلبات التغذية/الخدمات المنزلية/المتجر (نية فقط، لا بوابة دفع)،
push notifications الفعلية عبر Firebase، تسوية مستحقات الأخصائيين (specialist_settlements — الجدول
موجود، منطق الاحتساب والدفع الفعلي لم يُبنَ بعد)، تنظيف تذكيرات فحوصات الطفل تلقائيًا عند حذف الطفل
نفسه (لا عند حذف فحص بعينه فقط)، وبوابة دفع جزائرية فعلية (Chargily أو غيرها).
