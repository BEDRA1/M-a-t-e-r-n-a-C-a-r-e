import {
  ArticleCategory,
  AssessmentDomainName,
  ConsultationType,
  MealType,
  PrismaClient,
  ServiceKind,
  SpecialistStatus,
  SpecialistTrack,
  SubscriptionType,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

const CONSULTATION_REASONS_SEED = [
  'الاستعداد للأبوة',
  'دعم الزوجة أثناء الحمل',
  'التعامل مع القلق',
  'التواصل بين الزوجين',
  'بعد الولادة',
  'مشاكل نفسية أو أسرية',
  'أخرى',
];

const SUBSCRIPTION_PLANS_SEED: {
  code: string;
  nameAr: string;
  price: number;
  type: SubscriptionType;
  bookingCredits: number;
  courseCredits: number;
  unlimitedBookings: boolean;
  featuresJson: string[];
}[] = [
  {
    code: 'basic',
    nameAr: 'الرقمية',
    price: 2500,
    type: SubscriptionType.monthly,
    bookingCredits: 0,
    courseCredits: 0,
    unlimitedBookings: false,
    featuresJson: [
      'تتبع الحمل أسبوعياً',
      'حاسبة الحمل وموعد الولادة',
      'الوصول للمنصة والتنبيهات الطبية',
      'المكتبة الرقمية والـ AI Chatbot',
      'دليل نوم الطفل واللقاحات',
      'دليل النفاس والرضاعة',
      'التقييم النفسي الذاتي',
      'النصائح اليومية',
      'الإشعارات والتذكيرات',
      'دليل تتبع المزاج',
      'طلب المساعدة',
    ],
  },
  {
    code: 'premium',
    nameAr: 'المميزة',
    price: 5000,
    type: SubscriptionType.monthly,
    bookingCredits: 1,
    courseCredits: 1,
    unlimitedBookings: false,
    featuresJson: [
      'جميع خدمات الباقة الرقمية',
      'اختيار جلسة عن بعد مع أخصائية نفسية أو قابلة أو أخصائية تغذية',
      'اختيار دورة تدريبية واحدة',
    ],
  },
  {
    code: 'royal',
    nameAr: 'الملكية',
    price: 16000,
    type: SubscriptionType.monthly,
    bookingCredits: 999,
    courseCredits: 999,
    unlimitedBookings: true,
    featuresJson: [
      'خدمات الباقة الرقمية',
      'استشارة مع القابلة',
      'استشارة مع الأخصائية النفسية',
      'استشارة مع أخصائية التغذية',
      'دورة مع كل أخصائية لمدة 3 أشهر',
      'أولوية الرد على طلب المساعدة',
    ],
  },
  {
    code: 'postpartum',
    nameAr: 'النفاس',
    price: 6000,
    type: SubscriptionType.one_time,
    bookingCredits: 0,
    courseCredits: 0,
    unlimitedBookings: false,
    featuresJson: [
      'خدمات المتابعة الرقمية متاحة بالكامل',
      'جلسة مع الأخصائية النفسية وأخصائية التغذية لمدة 40 يوماً',
    ],
  },
  {
    code: 'couples',
    nameAr: 'الزوجين',
    price: 4000,
    type: SubscriptionType.one_time,
    bookingCredits: 1,
    courseCredits: 0,
    unlimitedBookings: false,
    featuresJson: [
      'حرية الاختيار كاملة (حضورياً / عن بعد)',
      'جلسة خاصة بالزوجين حضورياً لتهيئتهما معاً للمخاض والنفاس',
    ],
  },
];

// أخصائيون تجريبيون معتمدون مسبقًا (approved) مع فترات توفر مستقبلية للاختبار
// أسعار ثابتة موحّدة لكل نوع خدمة، بالدينار الجزائري لا بالسنتيم — مصدر الحقيقة الوحيد
// الذي يقرأه CoursesService.getServicePrice فعليًا عند إنشاء أي دورة جديدة
const SERVICE_PRICING_SEED: { serviceKind: ServiceKind; consultationType: ConsultationType; price: number }[] = [
  { serviceKind: ServiceKind.consultation, consultationType: ConsultationType.in_person, price: 2000 },
  { serviceKind: ServiceKind.consultation, consultationType: ConsultationType.remote, price: 1500 },
  { serviceKind: ServiceKind.course, consultationType: ConsultationType.in_person, price: 2500 },
  { serviceKind: ServiceKind.course, consultationType: ConsultationType.remote, price: 2000 },
];

const SPECIALISTS_SEED: {
  phone: string;
  email: string;
  fullName: string;
  wilaya: string;
  specialty: string;
  bio: string;
  yearsExperience: number;
  photoUrl: string;
  track: SpecialistTrack;
  slots: { daysFromNow: number; hour: number; durationHours: number; type: ConsultationType; wilaya?: string }[];
  courses?: {
    title: string;
    description: string;
    type: ConsultationType;
    capacity?: number;
    daysFromNow: number;
    durationText: string;
    durationDays: number;
    contentUrl?: string;
    wilaya?: string;
  }[];
}[] = [
  {
    phone: '0500000001',
    email: 'ahlem.specialist@maternacare.dz',
    fullName: 'بن جديدي سعاد',
    wilaya: 'الجزائر العاصمة',
    specialty: 'أخصائية نفسانية',
    bio: 'أخصائية نفسية بخبرة 8 سنوات في مرافقة الأمهات خلال الحمل، متخصصة في تقنيات إدارة القلق والاسترخاء.',
    yearsExperience: 8,
    photoUrl: 'https://images.unsplash.com/photo-1592621385612-4d7129426394?w=400&q=80&auto=format&fit=crop',
    track: SpecialistTrack.psychological,
    slots: [
      { daysFromNow: 3, hour: 9, durationHours: 1, type: ConsultationType.remote },
      { daysFromNow: 3, hour: 11, durationHours: 1, type: ConsultationType.in_person, wilaya: 'الجزائر العاصمة' },
      { daysFromNow: 5, hour: 14, durationHours: 1, type: ConsultationType.remote },
    ],
    courses: [
      {
        title: 'التحضير النفسي للولادة واستقبال المولود بثقة',
        description: 'دورة عن بُعد ترافقك في بناء استعداد نفسي واعٍ لتجربة الولادة واستقبال مولودك بثقة وطمأنينة.',
        type: ConsultationType.remote,
        daysFromNow: 10,
        durationText: 'أسبوع واحد',
        durationDays: 7,
        contentUrl: 'https://example.com/psychological-birth-readiness-course-content',
      },
      {
        title: 'التعامل مع القلق والخوف أثناء فترة الحمل',
        description: 'أدوات وتقنيات عملية للتعرّف على مصادر القلق أثناء الحمل والتعامل معها بأساليب مبنية على أسس علمية.',
        type: ConsultationType.remote,
        daysFromNow: 15,
        durationText: '10 أيام',
        durationDays: 10,
        contentUrl: 'https://example.com/psychological-anxiety-management-course-content',
      },
      {
        title: 'الاستعداد النفسي للأمومة والتغيرات الجديدة',
        description: 'دورة تساعدك على فهم التغيرات النفسية والاجتماعية المصاحبة للأمومة والاستعداد لها بثقة.',
        type: ConsultationType.remote,
        daysFromNow: 20,
        durationText: 'أسبوعان',
        durationDays: 14,
        contentUrl: 'https://example.com/psychological-motherhood-readiness-course-content',
      },
      {
        title: 'التكيف النفسي بعد الولادة وتجاوز الصعوبات',
        description: 'دعم نفسي منظّم لمرحلة ما بعد الولادة، يساعدك على تجاوز صعوباتها والتكيف معها بشكل صحي.',
        type: ConsultationType.remote,
        daysFromNow: 25,
        durationText: '10 أيام',
        durationDays: 10,
        contentUrl: 'https://example.com/psychological-postpartum-adjustment-course-content',
      },
      {
        title: 'التحضير النفسي للولادة',
        description: 'ورشة حضورية مكثفة ليوم كامل لبناء استعداد نفسي واعٍ لتجربة الولادة، بتمارين استرخاء وتنفس تحت إشراف مباشر.',
        type: ConsultationType.in_person,
        capacity: 15,
        daysFromNow: 14,
        durationText: 'يوم كامل (8 ساعات)',
        durationDays: 1,
        wilaya: 'الجزائر العاصمة',
      },
      {
        title: 'التكيف النفسي بعد الولادة',
        description: 'ورشة حضورية ليوم كامل لدعم الأمهات في التكيف مع التغيرات النفسية بعد الولادة، بمشاركة جماعية وتمارين عملية.',
        type: ConsultationType.in_person,
        capacity: 12,
        daysFromNow: 16,
        durationText: 'يوم كامل (8 ساعات)',
        durationDays: 1,
        wilaya: 'الجزائر العاصمة',
      },
      {
        title: 'الاستعداد النفسي للأمومة',
        description: 'ورشة حضورية ليوم كامل تساعد الأم على فهم التغيرات النفسية والاجتماعية المصاحبة للأمومة والاستعداد لها بثقة.',
        type: ConsultationType.in_person,
        capacity: 10,
        daysFromNow: 18,
        durationText: 'يوم كامل (8 ساعات)',
        durationDays: 1,
        wilaya: 'الجزائر العاصمة',
      },
    ],
  },
  {
    phone: '0500000002',
    email: 'karim.specialist@maternacare.dz',
    fullName: 'د. كريم مرزوقي',
    wilaya: 'وهران',
    specialty: 'اكتئاب ما بعد الولادة والدعم الزوجي',
    bio: 'أخصائي نفسي بخبرة 12 سنة في العلاج الأسري والدعم النفسي لما بعد الولادة، يقدّم استشارات للأزواج معًا.',
    yearsExperience: 12,
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80&auto=format&fit=crop',
    track: SpecialistTrack.psychological,
    slots: [
      { daysFromNow: 2, hour: 10, durationHours: 1, type: ConsultationType.remote },
      { daysFromNow: 4, hour: 16, durationHours: 1, type: ConsultationType.in_person, wilaya: 'وهران' },
    ],
  },
  {
    phone: '0500000003',
    email: 'sara.specialist@maternacare.dz',
    fullName: 'د. سارة حمداوي',
    wilaya: 'قسنطينة',
    specialty: 'التواصل الزوجي والتحضير النفسي للأبوة',
    bio: 'أخصائية علاقات أسرية بخبرة 6 سنوات، تساعد الأزواج على التواصل الفعّال خلال رحلة الحمل والأبوة المبكرة.',
    yearsExperience: 6,
    photoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80&auto=format&fit=crop',
    track: SpecialistTrack.psychological,
    slots: [
      { daysFromNow: 6, hour: 9, durationHours: 1, type: ConsultationType.remote },
      { daysFromNow: 7, hour: 13, durationHours: 1, type: ConsultationType.remote },
    ],
  },
  {
    phone: '0500000006',
    email: 'aya.specialist@maternacare.dz',
    fullName: 'فاضل آية',
    wilaya: 'الجزائر العاصمة',
    specialty: 'أخصائية نفسانية',
    bio: 'أخصائية نفسية تُرافق الأمهات خلال الحمل وبعد الولادة، مهتمة بالتعامل مع القلق والتقلبات المزاجية في هذه المرحلة.',
    yearsExperience: 5,
    photoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80&auto=format&fit=crop',
    track: SpecialistTrack.psychological,
    slots: [
      { daysFromNow: 2, hour: 10, durationHours: 1, type: ConsultationType.remote },
      { daysFromNow: 4, hour: 9, durationHours: 1, type: ConsultationType.in_person, wilaya: 'الجزائر العاصمة' },
    ],
  },
  {
    phone: '0500000007',
    email: 'fella.specialist@maternacare.dz',
    fullName: 'بن الشارف فلة',
    wilaya: 'الجزائر العاصمة',
    specialty: 'أخصائية نفسانية',
    bio: 'أخصائية نفسية تعمل مع الأمهات وأزواجهن على التحضير النفسي للولادة وتعزيز الدعم الأسري خلال رحلة الألف يوم.',
    yearsExperience: 6,
    photoUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80&auto=format&fit=crop',
    track: SpecialistTrack.psychological,
    slots: [
      { daysFromNow: 3, hour: 11, durationHours: 1, type: ConsultationType.remote },
      { daysFromNow: 5, hour: 13, durationHours: 1, type: ConsultationType.remote },
    ],
  },
  {
    phone: '0500000004',
    email: 'nadia.midwife@maternacare.dz',
    fullName: 'سلمي أسماء',
    wilaya: 'الجزائر العاصمة',
    specialty: 'قابلة',
    bio: 'قابلة معتمدة بخبرة 10 سنوات في متابعة الحمل والولادة الطبيعية، ومرافقة الأمهات في رعاية ما بعد الولادة والرضاعة الطبيعية.',
    yearsExperience: 10,
    photoUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80&auto=format&fit=crop',
    track: SpecialistTrack.health,
    slots: [
      { daysFromNow: 2, hour: 9, durationHours: 1, type: ConsultationType.remote },
      { daysFromNow: 3, hour: 10, durationHours: 1, type: ConsultationType.in_person, wilaya: 'الجزائر العاصمة' },
      { daysFromNow: 6, hour: 15, durationHours: 1, type: ConsultationType.remote },
    ],
    courses: [
      {
        title: 'إعداد خطة الولادة وتقنيات تقليل التدخلات',
        description: 'ورشة حضورية عملية لبناء خطة ولادة واضحة، والتعرف على تقنيات مثبتة لتقليل التدخلات الطبية غير الضرورية.',
        type: ConsultationType.in_person,
        capacity: 12,
        daysFromNow: 12,
        durationText: 'يوم واحد',
        durationDays: 1,
        wilaya: 'الجزائر العاصمة',
      },
      {
        title: 'فهم علامات المخاض ومتى يجب التوجه للمستشفى',
        description: 'دورة عن بُعد تشرح علامات بدء المخاض الحقيقي والفارق بينها وبين مخاض براكستون هيكس، ومتى يجب التوجه للمستشفى فورًا.',
        type: ConsultationType.remote,
        daysFromNow: 8,
        durationText: '3 أيام',
        durationDays: 3,
        contentUrl: 'https://example.com/health-labor-signs-course-content',
      },
      {
        title: 'التحضير الفعّال للولادة وتقنيات التنفس الصحيحة',
        description: 'ورشة حضورية عملية لتعلّم تقنيات التنفس والاسترخاء الصحيحة أثناء المخاض، بإشراف مباشر من القابلة.',
        type: ConsultationType.in_person,
        capacity: 15,
        daysFromNow: 20,
        durationText: 'يومان',
        durationDays: 2,
        wilaya: 'الجزائر العاصمة',
      },
      {
        title: 'أساسيات الرضاعة الطبيعية والعناية بالثدي',
        description: 'دورة عن بُعد تغطي أساسيات وضعية الرضاعة الصحيحة، إدارة الشائع من مشاكل الرضاعة، والعناية بالثدي خلالها.',
        type: ConsultationType.remote,
        daysFromNow: 14,
        durationText: 'أسبوع واحد',
        durationDays: 7,
        contentUrl: 'https://example.com/health-breastfeeding-basics-course-content',
      },
      {
        title: 'أساسيات العناية بالمولود الجديد',
        description: 'دورة عن بُعد تغطي أساسيات العناية اليومية بالمولود الجديد في الأسابيع الأولى: النوم، النظافة، وعلامات الاطمئنان الصحي.',
        type: ConsultationType.remote,
        daysFromNow: 18,
        durationText: 'أسبوع واحد',
        durationDays: 7,
        contentUrl: 'https://example.com/health-newborn-care-basics-course-content',
      },
      {
        title: 'التحضير للولادة وتقنيات التنفس',
        description: 'ورشة حضورية ليوم كامل لتعلّم تقنيات التنفس والاسترخاء الصحيحة أثناء المخاض، بإشراف مباشر من القابلة وتطبيق عملي جماعي.',
        type: ConsultationType.in_person,
        capacity: 15,
        daysFromNow: 14,
        durationText: 'يوم كامل (8 ساعات)',
        durationDays: 1,
        wilaya: 'الجزائر العاصمة',
      },
      {
        title: 'أساسيات الرضاعة الطبيعية',
        description: 'ورشة حضورية ليوم كامل لتعلّم وضعية الرضاعة الصحيحة وحل مشاكلها الشائعة عمليًا بمتابعة مباشرة من القابلة.',
        type: ConsultationType.in_person,
        capacity: 12,
        daysFromNow: 16,
        durationText: 'يوم كامل (8 ساعات)',
        durationDays: 1,
        wilaya: 'الجزائر العاصمة',
      },
      {
        title: 'العناية بالمولود الجديد',
        description: 'ورشة حضورية ليوم كامل تغطي أساسيات العناية اليومية بالمولود الجديد عمليًا: الاستحمام، النظافة، وعلامات الاطمئنان الصحي.',
        type: ConsultationType.in_person,
        capacity: 10,
        daysFromNow: 18,
        durationText: 'يوم كامل (8 ساعات)',
        durationDays: 1,
        wilaya: 'الجزائر العاصمة',
      },
    ],
  },
  {
    phone: '0500000005',
    email: 'amel.nutrition@maternacare.dz',
    fullName: 'فلالي هناء',
    wilaya: 'وهران',
    specialty: 'أخصائية تغذية',
    bio: 'أخصائية تغذية بخبرة 9 سنوات في إعداد برامج غذائية مخصصة لمراحل الحمل والرضاعة ورحلة الألف يوم الأولى من عمر الطفل.',
    yearsExperience: 9,
    photoUrl: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&q=80&auto=format&fit=crop',
    track: SpecialistTrack.nutrition,
    slots: [
      { daysFromNow: 3, hour: 11, durationHours: 1, type: ConsultationType.remote },
      { daysFromNow: 5, hour: 9, durationHours: 1, type: ConsultationType.in_person, wilaya: 'وهران' },
    ],
    courses: [
      {
        title: 'أساسيات التغذية الصحية والآمنة للحامل',
        description: 'دورة عن بُعد تشرح أساسيات التغذية الصحية والآمنة خلال الحمل، والأطعمة الواجب تجنبها لحماية سلامة الحمل.',
        type: ConsultationType.remote,
        daysFromNow: 10,
        durationText: 'أسبوع واحد',
        durationDays: 7,
        contentUrl: 'https://example.com/nutrition-safe-basics-course-content',
      },
      {
        title: 'التغذية المتوازنة في كل مرحلة من مراحل الحمل',
        description: 'دورة عملية حول كيفية إعداد وجبات متوازنة تتناسب مع احتياجات كل ثلث من أثلاث الحمل الثلاثة.',
        type: ConsultationType.remote,
        daysFromNow: 15,
        durationText: '10 أيام',
        durationDays: 10,
        contentUrl: 'https://example.com/nutrition-balanced-trimesters-course-content',
      },
      {
        title: 'العناصر الغذائية الأساسية لصحة الأم والجنين',
        description: 'دورة عن بُعد تتعمّق في العناصر الغذائية الأساسية (الحديد، الكالسيوم، حمض الفوليك وغيرها) وأهميتها لصحة الأم والجنين.',
        type: ConsultationType.remote,
        daysFromNow: 20,
        durationText: 'أسبوع واحد',
        durationDays: 7,
        contentUrl: 'https://example.com/nutrition-essential-nutrients-course-content',
      },
      {
        title: 'التغذية الصحية والداعمة خلال فترة النفاس',
        description: 'دورة عن بُعد تركّز على الاحتياجات الغذائية الخاصة بمرحلة النفاس ودعم التعافي والرضاعة الطبيعية.',
        type: ConsultationType.remote,
        daysFromNow: 25,
        durationText: '10 أيام',
        durationDays: 10,
        contentUrl: 'https://example.com/nutrition-postpartum-support-course-content',
      },
      {
        title: 'التغذية الصحية للحامل',
        description: 'ورشة حضورية ليوم كامل لبناء نظام غذائي صحي وآمن للحامل، مع أمثلة وجبات عملية وتوصيات فردية بمتابعة مباشرة.',
        type: ConsultationType.in_person,
        capacity: 15,
        daysFromNow: 14,
        durationText: 'يوم كامل (8 ساعات)',
        durationDays: 1,
        wilaya: 'الجزائر العاصمة',
      },
      {
        title: 'التغذية في مراحل الحمل',
        description: 'ورشة حضورية ليوم كامل لفهم الاحتياجات الغذائية المتغيّرة عبر أثلاث الحمل الثلاثة وكيفية تكييف الوجبات معها عمليًا.',
        type: ConsultationType.in_person,
        capacity: 12,
        daysFromNow: 16,
        durationText: 'يوم كامل (8 ساعات)',
        durationDays: 1,
        wilaya: 'الجزائر العاصمة',
      },
      {
        title: 'التغذية خلال النفاس والرضاعة',
        description: 'ورشة حضورية ليوم كامل حول الاحتياجات الغذائية الخاصة بفترة النفاس ودعم الرضاعة الطبيعية بأمثلة وجبات عملية.',
        type: ConsultationType.in_person,
        capacity: 10,
        daysFromNow: 18,
        durationText: 'يوم كامل (8 ساعات)',
        durationDays: 1,
        wilaya: 'الجزائر العاصمة',
      },
    ],
  },
];

// 5 أسئلة لكل محور تكفي الآن (مقياس Likert 0-3)، راجع src/assessments/lib/classify.ts لمنطق التصنيف
// النظام القديم (5 محاور عامة بأسئلة غير معيارية) — أُبقي عليه هنا فقط لأن نتائج
// حقيقية تاريخية في assessment_results ترتبط به فعلاً ولا يجوز حذفه. isLegacy=true
// تُضبط صراحة أدناه في حلقة الزرع؛ لم تعد هذه المحاور تُعرض في قائمة المقاييس الجديدة
// ولا تقبل تقييمات جديدة (يُمنع ذلك في AssessmentsService.submit)
const ASSESSMENT_DOMAINS_SEED = [
  {
    name: AssessmentDomainName.anxiety,
    nameAr: 'القلق',
    questions: [
      'هل شعرتِ بالتوتر أو العصبية دون سبب واضح؟',
      'هل واجهتِ صعوبة في التوقف عن القلق بمجرد أن يبدأ؟',
      'هل شعرتِ بالانزعاج بسهولة؟',
      'هل واجهتِ صعوبة في الاسترخاء؟',
      'هل شعرتِ بالخوف من حدوث شيء سيئ؟',
    ],
  },
  {
    name: AssessmentDomainName.depression,
    nameAr: 'الاكتئاب',
    questions: [
      'هل شعرتِ بقلة الاهتمام أو المتعة في الأنشطة التي كنتِ تستمتعين بها؟',
      'هل شعرتِ بالحزن أو الإحباط أو اليأس؟',
      'هل شعرتِ بالتعب أو قلة الطاقة؟',
      'هل واجهتِ صعوبة في التركيز؟',
      'هل شعرتِ بعدم الرضا عن نفسك أو أنكِ فاشلة؟',
    ],
  },
  {
    name: AssessmentDomainName.stress,
    nameAr: 'التوتر',
    questions: [
      'هل شعرتِ أن الأمور تتراكم عليكِ أكثر مما تستطيعين التعامل معه؟',
      'هل شعرتِ بالانفعال أو التهيّج بسرعة؟',
      'هل واجهتِ صعوبة في تنظيم أولوياتك اليومية؟',
      'هل شعرتِ بشد عضلي أو صداع مرتبط بالتوتر؟',
      'هل شعرتِ أنكِ بحاجة لوقت أطول لإنجاز المهام بسبب التوتر؟',
    ],
  },
  {
    name: AssessmentDomainName.pressure,
    nameAr: 'الضغط النفسي',
    questions: [
      'هل شعرتِ بضغط من التوقعات المحيطة بكِ (الأسرة، العمل، المجتمع)؟',
      'هل شعرتِ بعبء المسؤوليات الملقاة عليكِ؟',
      'هل شعرتِ أنكِ مضطرة لإخفاء مشاعرك الحقيقية أمام الآخرين؟',
      'هل شعرتِ بصعوبة في طلب المساعدة عند الحاجة؟',
      'هل شعرتِ أن وقتك لا يكفي لنفسك؟',
    ],
  },
  {
    name: AssessmentDomainName.sleep,
    nameAr: 'النوم',
    questions: [
      'هل واجهتِ صعوبة في النوم ليلاً؟',
      'هل استيقظتِ عدة مرات أثناء الليل؟',
      'هل شعرتِ بالتعب رغم عدد ساعات نوم كافٍ؟',
      'هل استغرقتِ وقتًا طويلاً لتغفي؟',
      'هل أثّر قلة النوم على مزاجك أو نشاطك خلال اليوم؟',
    ],
  },
];

// مقياس اضطراب القلق العام GAD-7 (Spitzer et al., 2006) — 7 بنود بنفس خيارات
// الإجابة الأربعة لكل بند. الترجمة العربية أدناه مسودة أولية تحتاج مراجعة أخصائية
// نفسانية قبل الإطلاق الفعلي — راجع الرد النهائي لهذه المهمة لتفاصيل هذا التنويه.
const GAD7_OPTIONS = ['إطلاقًا', 'عدة أيام', 'أكثر من نصف الأيام', 'تقريبًا كل يوم'];

const GAD7_SEED = {
  name: AssessmentDomainName.gad7,
  nameAr: 'مقياس القلق العام (GAD-7)',
  descriptionAr: 'مقياس معياري قصير لفحص أعراض القلق العام خلال الأسبوعين الماضيين.',
  instructionsAr: 'خلال الأسبوعين الماضيين، كم مرة أزعجتك أيٌّ من المشكلات التالية؟',
  questions: [
    { textAr: 'الشعور بالعصبية أو القلق أو التوتر', options: GAD7_OPTIONS, reverseScored: false, isCritical: false },
    { textAr: 'عدم القدرة على إيقاف القلق أو السيطرة عليه', options: GAD7_OPTIONS, reverseScored: false, isCritical: false },
    { textAr: 'القلق الزائد بشأن أمور مختلفة', options: GAD7_OPTIONS, reverseScored: false, isCritical: false },
    { textAr: 'صعوبة الاسترخاء', options: GAD7_OPTIONS, reverseScored: false, isCritical: false },
    { textAr: 'عدم القدرة على الجلوس بهدوء من شدة التململ', options: GAD7_OPTIONS, reverseScored: false, isCritical: false },
    { textAr: 'الانزعاج أو الاستثارة بسهولة', options: GAD7_OPTIONS, reverseScored: false, isCritical: false },
    { textAr: 'الشعور بالخوف كأن شيئًا سيئًا قد يحدث', options: GAD7_OPTIONS, reverseScored: false, isCritical: false },
  ],
};

// مقياس إدنبرة لاكتئاب ما بعد الولادة EPDS (Cox, Holden & Sagovsky, 1987) — 10 بنود.
// تحذير بالغ الأهمية: البنود 3، 5، 6، 7، 8، 9، 10 معكوسة التدريج (reverseScored: true) —
// أول خيار معروض للمستخدمة هو الأشد وطأةً ويُسجَّل 3، لا 0. البند العاشر (isCritical: true)
// خاص بأفكار إيذاء النفس ويُفعّل بروتوكول السلامة تلقائيًا في AssessmentsService.submit.
// الترجمة العربية أدناه مسودة أولية تحتاج مراجعة أخصائية نفسانية قبل الإطلاق الفعلي.
const EPDS_SEED = {
  name: AssessmentDomainName.epds,
  nameAr: 'مقياس إدنبرة لاكتئاب ما بعد الولادة (EPDS)',
  descriptionAr: 'مقياس معياري لفحص أعراض اكتئاب ما بعد الولادة خلال الأيام السبعة الماضية.',
  instructionsAr: 'خلال الأيام السبعة الماضية...',
  questions: [
    {
      textAr: 'كنت قادرة على الضحك ورؤية الجانب المرح من الأمور',
      options: ['بقدر ما كنت دائمًا', 'بدرجة أقل قليلًا الآن', 'بدرجة أقل بكثير الآن', 'لم أستطع إطلاقًا'],
      reverseScored: false,
      isCritical: false,
    },
    {
      textAr: 'تطلّعتُ إلى الأشياء بمتعة وشوق',
      options: ['بقدر ما كنت دائمًا', 'أقل مما كنت عليه', 'أقل بكثير مما كنت عليه', 'بالكاد'],
      reverseScored: false,
      isCritical: false,
    },
    {
      textAr: 'لُمتُ نفسي دون داعٍ عندما ساءت الأمور',
      options: ['نعم، في معظم الأوقات', 'نعم، في بعض الأوقات', 'ليس كثيرًا', 'لا، أبدًا'],
      reverseScored: true,
      isCritical: false,
    },
    {
      textAr: 'شعرت بالقلق أو التوتر دون سبب واضح',
      options: ['لا، إطلاقًا', 'نادرًا', 'نعم، أحيانًا', 'نعم، كثيرًا'],
      reverseScored: false,
      isCritical: false,
    },
    {
      textAr: 'شعرت بالخوف أو الذعر دون سبب واضح',
      options: ['نعم، بشكل كبير', 'نعم، أحيانًا', 'لا، ليس كثيرًا', 'لا، إطلاقًا'],
      reverseScored: true,
      isCritical: false,
    },
    {
      textAr: 'شعرت أن الأمور تفوق طاقتي',
      options: [
        'نعم، في معظم الأوقات لم أستطع التعامل مع الأمور إطلاقًا',
        'نعم، أحيانًا لم أكن أتعامل معها كالمعتاد',
        'لا، في معظم الأوقات تعاملت معها بشكل جيد',
        'لا، تعاملت معها كالمعتاد تمامًا',
      ],
      reverseScored: true,
      isCritical: false,
    },
    {
      textAr: 'شعرت بحزن جعلني أواجه صعوبة في النوم',
      options: ['نعم، في معظم الأوقات', 'نعم، أحيانًا', 'ليس كثيرًا', 'لا، إطلاقًا'],
      reverseScored: true,
      isCritical: false,
    },
    {
      textAr: 'شعرت بالحزن أو التعاسة',
      options: ['نعم، في معظم الأوقات', 'نعم، كثيرًا', 'ليس كثيرًا', 'لا، إطلاقًا'],
      reverseScored: true,
      isCritical: false,
    },
    {
      textAr: 'شعرت بتعاسة جعلتني أبكي',
      options: ['نعم، في معظم الأوقات', 'نعم، كثيرًا', 'أحيانًا فقط', 'لا، أبدًا'],
      reverseScored: true,
      isCritical: false,
    },
    {
      textAr: 'راودتني أفكار عن إيذاء نفسي',
      options: ['نعم، كثيرًا', 'أحيانًا', 'نادرًا جدًا', 'لا، أبدًا'],
      reverseScored: true,
      isCritical: true,
    },
  ],
};

const DAILY_TIPS_SEED = [
  'اشربي كمية كافية من الماء يوميًا لتحافظي على ترطيب جسمك.',
  'خصصي 10 دقائق يوميًا للتنفس العميق والاسترخاء.',
  'لا تترددي في طلب المساعدة من المقربين عند الحاجة.',
  'المشي الخفيف يوميًا يحسّن مزاجك ودورتك الدموية.',
  'احرصي على نوم كافٍ، فهو ضروري لصحتك النفسية والجسدية.',
  'تناولي وجبات متوازنة غنية بالخضروات والفواكه.',
  'شاركي مشاعرك مع شريكك أو صديقة مقرّبة، فالتعبير يخفف العبء.',
  'امنحي نفسك وقتًا يوميًا للراحة دون شعور بالذنب.',
  'تجنبي مقارنة تجربتك بتجارب الأخريات، فكل رحلة مختلفة.',
  'الاستماع للموسيقى الهادئة يساعد على تهدئة الأعصاب.',
  'لا بأس أن تطلبي المساعدة المتخصصة إن شعرتِ أن الأمر يفوق طاقتك.',
  'احتفلي بالإنجازات الصغيرة في رحلتك اليومية.',
  'التمارين الخفيفة المناسبة لحالتك تعزز طاقتك ونومك.',
  'حافظي على تواصل منتظم مع طبيبتك لمتابعة صحتك.',
  'تذكّري أنكِ تبذلين قصارى جهدك، وهذا يكفي.',

  // النصائح اليومية العامة
  'امنحي نفسك وقتاً للراحة كل يوم، فالعناية بصحتك النفسية لا تقل أهمية عن العناية بصحتك الجسدية.',
  'احرصي على شرب كمية كافية من الماء يومياً للحفاظ على ترطيب الجسم.',
  'احرصي على تناول وجبات متوازنة ومتنوعة تحتوي على البروتين والحبوب الكاملة والخضروات والفواكه.',
  'استقي معلوماتك من مصادر موثوقة أو من المختصين، فالمعرفة الصحيحة تقلل من القلق والخوف.',
];

// نصائح إشعار "نصيحة اليوم" الحقيقي (WellnessTip) — تُرسَل كإشعار فعلي لكل المستخدمات عبر
// DailyWellnessTipScheduler، بتناوب يومي حسب رقم اليوم في السنة (نفس منطق DailyTipsService)
const WELLNESS_TIPS_SEED: { category: string; tipTextAr: string }[] = [
  // الجانب النفسي
  {
    category: 'الجانب النفسي',
    tipTextAr: 'خبر الحمل قد يثير مشاعر مختلفة بين الفرح والقلق، وهذا أمر طبيعي، فامنحي نفسك الوقت للتكيف مع هذه المرحلة.',
  },
  {
    category: 'الجانب النفسي',
    tipTextAr: 'خصصي بضع دقائق يومياً للتنفس العميق أو الاسترخاء، فذلك يساعد على التخفيف من التوتر.',
  },
  {
    category: 'الجانب النفسي',
    tipTextAr: 'عبّري عن مشاعرك وتحدثي مع الأشخاص الذين تثقين بهم، فالدعم الاجتماعي مهم خلال الحمل.',
  },
  {
    category: 'الجانب النفسي',
    tipTextAr: 'تابعي حالتك المزاجية داخل التطبيق بانتظام، فالمتابعة تساعدك على ملاحظة أي تغيرات نفسية مبكراً.',
  },
  // الجانب الصحي
  {
    category: 'الجانب الصحي',
    tipTextAr: 'التزمي بمواعيد متابعة الحمل والفحوصات التي يوصي بها الطبيب أو القابلة.',
  },
  {
    category: 'الجانب الصحي',
    tipTextAr: 'تناولي الأدوية والمكملات الموصوفة لك فقط، ولا تستخدمي أي دواء دون استشارة المختص.',
  },
  {
    category: 'الجانب الصحي',
    tipTextAr: 'احرصي على شرب كمية كافية من الماء والحصول على قسط كافٍ من النوم والراحة.',
  },
  {
    category: 'الجانب الصحي',
    tipTextAr: 'مارسي نشاطاً بدنياً مناسباً لحالتك الصحية وبعد موافقة الطبيب أو القابلة.',
  },
  // الجانب الغذائي
  {
    category: 'الجانب الغذائي',
    tipTextAr: 'احرصي على تناول غذاء متوازن ومتنوع يشمل الخضروات والفواكه والحبوب الكاملة والبروتين.',
  },
  {
    category: 'الجانب الغذائي',
    tipTextAr: 'اهتمي بمصادر الحديد والكالسيوم والبروتين خلال مراحل الحمل المختلفة.',
  },
  {
    category: 'الجانب الغذائي',
    tipTextAr: 'تناولي مصادر فيتامين C مع الأطعمة الغنية بالحديد للمساعدة على تحسين امتصاصه.',
  },
  {
    category: 'الجانب الغذائي',
    tipTextAr: 'اشربي الماء بانتظام، وقللي من المشروبات الغنية بالسكر والكافيين.',
  },
];

// محتوى كامل للأسابيع 1-40 من رحلة الحمل
const WEEK_CONTENT_SEED = [
  {
    weekNumber: 1,
    babySizeComparison: 'لم يتشكّل الجنين بعد',
    babyWeightGrams: null,
    babyLengthCm: null,
    bodyChangesText: 'يُحسب هذا الأسبوع من أول يوم في آخر دورة شهرية، أي قبل حدوث الحمل فعليًا بأيام. جسمك يستعد الآن للتبويض، وقد لا تشعرين بأي تغيير مختلف عن المعتاد.',
    tipsJson: [
      'إن كنتِ تخططين للحمل، ابدئي بتناول حمض الفوليك يوميًا',
      'تجنبي التدخين والكحول من الآن',
      'احرصي على نظام غذائي متوازن وراحة كافية',
    ],
    developmentJson: {
      points: [
        'لم يحدث الإخصاب بعد في هذا الأسبوع',
        'المبيض يُحضّر بويضة تستعد للتبويض القادم',
        'بطانة الرحم تتجدد استعدادًا لاستقبال حمل محتمل',
      ],
    },
  },
  {
    weekNumber: 2,
    babySizeComparison: 'لا يوجد جنين بعد — أسبوع التبويض',
    babyWeightGrams: null,
    babyLengthCm: null,
    bodyChangesText: 'يقترب موعد التبويض هذا الأسبوع، وهو الوقت الأخصب لحدوث الحمل. قد تلاحظين تغيرًا خفيفًا في الإفرازات المهبلية، وهذا أمر طبيعي تمامًا.',
    tipsJson: [
      'راقبي علامات التبويض إن كنتِ تخططين للحمل',
      'استمري في تناول حمض الفوليك يوميًا',
      'حافظي على نشاط بدني معتدل ونوم كافٍ',
    ],
    developmentJson: {
      points: [
        'يُطلق أحد المبيضين بويضة ناضجة نحو قناة فالوب',
        'قد يحدث الإخصاب خلال الساعات القليلة التالية للتبويض',
        'بطانة الرحم تستمر في التهيؤ لاستقبال حمل محتمل',
      ],
    },
  },
  {
    weekNumber: 3,
    babySizeComparison: 'بحجم رأس الدبوس تقريبًا',
    babyWeightGrams: null,
    babyLengthCm: null,
    bodyChangesText: 'قد يكون الإخصاب قد حدث هذا الأسبوع، لكن أعراض الحمل عادة لا تظهر بعد ولا يمكن كشفه باختبار منزلي حتى الآن. لا داعي للقلق إن لم تشعري بأي شيء مختلف.',
    tipsJson: [
      'استمري بأخذ حمض الفوليك يوميًا دون انقطاع',
      'تجنبي الأشعة السينية وأي أدوية دون استشارة الطبيب',
      'انتظري موعد الدورة القادمة قبل إجراء اختبار الحمل',
    ],
    developmentJson: {
      points: [
        'تنتقل البويضة المخصَّبة (الزيجوت) نحو الرحم وهي تنقسم بسرعة',
        'تتكوّن كتلة صغيرة من الخلايا تُعرف بالكيسة الأريمية',
        'تبدأ الاستعدادات الأولى للانغراس في بطانة الرحم',
      ],
    },
  },
  {
    weekNumber: 4,
    babySizeComparison: 'بحجم حبة الخشخاش',
    babyWeightGrams: 1,
    babyLengthCm: 0.4,
    bodyChangesText: 'قد تُلاحظين تأخر الدورة الشهرية، وربما تظهر أولى علامات الحمل كالتعب الخفيف أو الغثيان الصباحي أو حساسية الثدي. اختبار الحمل المنزلي يصبح موثوقًا من الآن.',
    tipsJson: [
      'ابدئي بتناول حمض الفوليك يوميًا إن لم تكوني بدأتِ بعد',
      'احجزي موعدًا مبكرًا مع طبيبك لتأكيد الحمل',
      'تجنبي التدخين والكحول والأدوية غير الآمنة',
    ],
    developmentJson: {
      points: [
        'تنغرس الكيسة الأريمية في بطانة الرحم',
        'يبدأ تكوّن المشيمة والحبل السري اللذين سيغذّيان طفلك طوال الحمل',
        'يتشكّل الأنبوب العصبي الذي سيصبح لاحقًا الدماغ والحبل الشوكي',
      ],
    },
  },
  {
    weekNumber: 5,
    babySizeComparison: 'بحجم بذرة السمسم',
    babyWeightGrams: 1,
    babyLengthCm: 0.5,
    bodyChangesText: 'قد تبدأ أعراض الحمل المبكرة بالوضوح أكثر: غثيان خفيف، إرهاق، وتقلبات مزاجية بسبب التغيرات الهرمونية السريعة. كل هذا طبيعي في هذه المرحلة.',
    tipsJson: [
      'تناولي وجبات صغيرة ومتكررة لتخفيف الغثيان',
      'احرصي على قسط كافٍ من الراحة والنوم',
      'أخبري طبيبك بأي أعراض تقلقك مهما بدت بسيطة',
    ],
    developmentJson: {
      points: [
        'يبدأ القلب الصغير بالتشكّل وقد ينبض لأول مرة قبل نهاية هذا الأسبوع',
        'يتكوّن الأنبوب العصبي بشكل كامل تقريبًا',
        'تبدأ البراعم الأولى التي ستصبح لاحقًا الذراعين والساقين',
      ],
    },
  },
  {
    weekNumber: 6,
    babySizeComparison: 'بحجم حبة العدس',
    babyWeightGrams: 1,
    babyLengthCm: 0.6,
    bodyChangesText: 'الغثيان الصباحي وحساسية الثدي قد يزدادان هذا الأسبوع، وقد تشعرين بالتعب أكثر من المعتاد. شرب الماء بكثرة وتناول وجبات خفيفة متكررة يساعدان كثيرًا.',
    tipsJson: [
      'اشربي كمية كافية من الماء على مدار اليوم',
      'جرّبي الزنجبيل أو الليمون لتخفيف الغثيان',
      'تجنبي الروائح القوية التي قد تُحفّز الغثيان',
    ],
    developmentJson: {
      points: [
        'ينبض قلب طفلك الآن بمعدل يمكن رصده بجهاز السونار المهبلي',
        'تبدأ ملامح الوجه بالتشكّل تدريجيًا: العينين والأذنين',
        'يستمر نمو الدماغ بوتيرة سريعة جدًا',
      ],
    },
  },
  {
    weekNumber: 7,
    babySizeComparison: 'بحجم حبة التوت الصغيرة',
    babyWeightGrams: 1,
    babyLengthCm: 1.3,
    bodyChangesText: 'قد يزداد التبول المتكرر بسبب تمدد الرحم والتغيرات الهرمونية. الغثيان قد يبقى حاضرًا، وربما تلاحظين نفورًا من أطعمة كنتِ تحبينها سابقًا.',
    tipsJson: [
      'قسّمي وجباتك إلى كميات صغيرة على مدار اليوم',
      'تجنبي الأطعمة الدهنية أو الحارة إن زادت الغثيان',
      'حافظي على متابعة مواعيدك الطبية بانتظام',
    ],
    developmentJson: {
      points: [
        'تنمو الذراعان والساقان الصغيرتان وتظهر ملامح الأصابع',
        'تتكوّن الكلى المبكرة وتبدأ بعض الأعضاء الداخلية بالعمل',
        'يزداد حجم الرأس نسبيًا مع استمرار نمو الدماغ السريع',
      ],
    },
  },
  {
    weekNumber: 8,
    babySizeComparison: 'بحجم حبة التوت',
    babyWeightGrams: 1,
    babyLengthCm: 1.6,
    bodyChangesText: 'الغثيان الصباحي وحساسية الثدي قد تكون في ذروتها هذا الأسبوع، والتبول المتكرر يزداد مع تمدد الرحم. هذه الأعراض علامة على أن حملك يتقدم بشكل طبيعي.',
    tipsJson: [
      'تناولي وجبات صغيرة ومتكررة بدل الوجبات الكبيرة',
      'حافظي على الترطيب الجيد بشرب الماء تدريجيًا',
      'استشيري الطبيب بخصوص الفيتامينات المناسبة لحملك',
    ],
    developmentJson: {
      points: [
        'تتكوّن الأعضاء الرئيسية جميعها في صورتها الأولية',
        'تصبح نبضات القلب واضحة وقابلة للرصد بالسونار',
        'تبدأ الأصابع الصغيرة بالانفصال عن بعضها في اليدين والقدمين',
      ],
    },
  },
  {
    weekNumber: 9,
    babySizeComparison: 'بحجم حبة العنب',
    babyWeightGrams: 2,
    babyLengthCm: 2.3,
    bodyChangesText: 'قد تلاحظين تغيرات في شكل ثدييك وبدء بروز خفيف في البطن لدى بعض الأمهات. الإرهاق والغثيان ما زالا شائعين، وهذا طبيعي في نهاية الشهر الثاني.',
    tipsJson: [
      'ارتدي ملابس داخلية مريحة تدعم التغيرات في جسمك',
      'استمري بتناول حمض الفوليك والفيتامينات الموصوفة',
      'خذي قسطًا من الراحة كلما شعرتِ بالحاجة لذلك',
    ],
    developmentJson: {
      points: [
        'ينتقل الجنين من مرحلة "المضغة" إلى مرحلة "الجنين" رسميًا',
        'تبدأ الأجفان بالتكوّن لتغطية العينين',
        'تنمو أصابع اليدين والقدمين وتصبح مفاصل الكوع والركبة مرئية',
      ],
    },
  },
  {
    weekNumber: 10,
    babySizeComparison: 'بحجم حبة الفراولة الصغيرة',
    babyWeightGrams: 4,
    babyLengthCm: 3.1,
    bodyChangesText: 'قد تبدأ أعراض الغثيان بالتراجع تدريجيًا لدى بعض الأمهات مع اقتراب نهاية الثلث الأول، بينما تستمر لدى أخريات — كلا الأمرين طبيعي تمامًا ولا يدل على شيء سلبي.',
    tipsJson: [
      'واصلي متابعة موعد فحص السونار الأول مع طبيبك',
      'تناولي غذاءً غنيًا بالحديد والكالسيوم',
      'مارسي المشي الخفيف إن سمحت حالتك الصحية بذلك',
    ],
    developmentJson: {
      points: [
        'اكتملت جميع الأعضاء الأساسية في صورتها الأولية وبدأت بالنمو والتخصص',
        'تبدأ الأظافر الصغيرة بالتشكّل على أصابع اليدين والقدمين',
        'يمكن لطفلك الآن أن يحرّك ذراعيه وساقيه بحركات صغيرة غير محسوسة بعد',
      ],
    },
  },
  {
    weekNumber: 11,
    babySizeComparison: 'بحجم حبة التين الصغيرة',
    babyWeightGrams: 7,
    babyLengthCm: 4.1,
    bodyChangesText: 'قد تبدأ طاقتك بالعودة تدريجيًا مع اقتراب نهاية الثلث الأول، والغثيان يخفّ لدى كثير من الأمهات. قد يبدأ الخصر بالتوسّع قليلًا حتى قبل ظهور بروز واضح في البطن.',
    tipsJson: [
      'اختاري ملابس مريحة تتماشى مع تغيرات جسمك التدريجية',
      'استمري بنظام غذائي متوازن غني بالبروتين والخضروات',
      'ناقشي مع طبيبك الفحوصات الموصى بها لهذه المرحلة',
    ],
    developmentJson: {
      points: [
        'تنمو الأصابع بشكل كامل وتنفصل تمامًا عن بعضها',
        'يبدأ الجنين بحركات صغيرة كالتمطي والابتلاع، وإن كانت غير محسوسة بعد',
        'تتشكّل البراعم الأولى للأسنان تحت اللثة',
      ],
    },
  },
  {
    weekNumber: 12,
    babySizeComparison: 'بحجم حبة الليمون',
    babyWeightGrams: 14,
    babyLengthCm: 5.4,
    bodyChangesText: 'نهاية الثلث الأول غالبًا ما تُخفف من أعراض الغثيان والإرهاق تدريجيًا، وقد يبدأ ظهور بروز بسيط في أسفل البطن. هذه مرحلة يشعر فيها كثير من الأمهات بارتياح ملحوظ.',
    tipsJson: [
      'موعد فحص السونار الأول (قياس الشفافية القفوية) مهم في هذه الفترة',
      'ابدئي بممارسة رياضة خفيفة كالمشي إن سمح طبيبك بذلك',
      'يمكنك الآن مشاركة خبر الحمل مع من حولك إن رغبتِ',
    ],
    developmentJson: {
      points: [
        'اكتمل تكوّن جميع الأعضاء الأساسية وبدأت بالنمو والتخصص',
        'يبدأ النخاع الشوكي والدماغ بالتنسيق مع العضلات لإنتاج حركات أكثر تناسقًا',
        'تبدأ الكليتان بإنتاج كميات صغيرة من البول',
      ],
    },
  },
  {
    weekNumber: 13,
    babySizeComparison: 'بحجم حبة الخوخ',
    babyWeightGrams: 23,
    babyLengthCm: 7.4,
    bodyChangesText: 'أهلًا بكِ في الثلث الثاني من الحمل — وهو غالبًا الأكثر راحة. الغثيان يتراجع لدى معظم الأمهات، وتعود الطاقة والشهية تدريجيًا.',
    tipsJson: [
      'استغلي عودة طاقتك لتنظيم وجباتك ونشاطك اليومي',
      'ابدئي التفكير في متابعة دورات تحضيرية للولادة إن رغبتِ',
      'حافظي على ترطيب بشرتك لتقليل احتمال ظهور علامات التمدد',
    ],
    developmentJson: {
      points: [
        'تتشكّل الحبال الصوتية استعدادًا للصراخ بعد الولادة',
        'يبدأ الجهاز الهضمي بالتدرّب على الحركة الانقباضية',
        'يتوضّح الفرق بين بصمات الأصابع الفريدة لطفلك',
      ],
    },
  },
  {
    weekNumber: 14,
    babySizeComparison: 'بحجم ثمرة الليمون الكبيرة',
    babyWeightGrams: 43,
    babyLengthCm: 8.7,
    bodyChangesText: 'قد يبدأ بروز البطن بالوضوح أكثر الآن، وربما تشعرين بتحسّن ملحوظ في المزاج والطاقة مقارنة بالثلث الأول.',
    tipsJson: [
      'اختاري حمالة صدر داعمة مع نمو حجم الثدي',
      'استمري بتناول الحديد والكالسيوم حسب توصية طبيبك',
      'مارسي تمارين تنفس بسيطة للاسترخاء',
    ],
    developmentJson: {
      points: [
        'تنمو ملامح الوجه بشكل أوضح: الحاجبان والرموش تبدأ بالتشكّل',
        'يستطيع الجنين تحريك رأسه وقد يبدأ بمصّ إبهامه',
        'يزداد نشاط الكبد في إنتاج خلايا الدم',
      ],
    },
  },
  {
    weekNumber: 15,
    babySizeComparison: 'بحجم ثمرة الفلفل الحلو',
    babyWeightGrams: 70,
    babyLengthCm: 10.1,
    bodyChangesText: 'قد تلاحظين زيادة تدريجية في وزنك وبروز البطن. بعض الأمهات يبدأن بملاحظة احتقان خفيف في الأنف بسبب التغيرات الهرمونية، وهذا أمر شائع وطبيعي.',
    tipsJson: [
      'تناولي غذاءً غنيًا بالأوميغا 3 لدعم نمو دماغ طفلك',
      'استخدمي بخاخ ماء البحر إن أزعجك احتقان الأنف',
      'حافظي على وضعية جلوس ونوم مريحة لدعم ظهرك',
    ],
    developmentJson: {
      points: [
        'يستطيع الجنين الآن الشعور بالضوء عبر جفنيه المغلقتين',
        'تتشكّل عظام الهيكل العظمي وتصبح أكثر صلابة تدريجيًا',
        'تنمو الأذنان في مكانهما النهائي على الرأس',
      ],
    },
  },
  {
    weekNumber: 16,
    babySizeComparison: 'بحجم ثمرة الأفوكادو',
    babyWeightGrams: 100,
    babyLengthCm: 11.6,
    bodyChangesText: 'قد تبدئين بالشعور بحركة خفيفة أشبه برفرفة فراشة — بعض الأمهات يشعرن بها الآن خاصة في الحمل الثاني أو ما بعده. لا تقلقي إن لم تشعري بها بعد، فهذا طبيعي أيضًا.',
    tipsJson: [
      'انتبهي لوضعية نومك، وفضّلي النوم على جانبكِ الأيسر تدريجيًا',
      'استمري بالمتابعة الدورية مع طبيبك لقياس ضغط الدم والوزن',
      'اشربي كمية كافية من الماء لتقليل احتمال الإمساك',
    ],
    developmentJson: {
      points: [
        'تتطور عضلات الوجه بما يكفي لتكوين تعابير كالتجهم أو الابتسام',
        'ينمو الجهاز الدوري بشكل كامل ويضخ القلب كمية أكبر من الدم',
        'يمكن لطفلك الآن تحريك عينيه وإن كانتا مغلقتين',
      ],
    },
  },
  {
    weekNumber: 17,
    babySizeComparison: 'بحجم ثمرة الرمان',
    babyWeightGrams: 140,
    babyLengthCm: 13.0,
    bodyChangesText: 'قد يزداد وزنك بشكل ملحوظ هذا الأسبوع، وربما تشعرين بآلام خفيفة في جانبي البطن نتيجة تمدد الأربطة الداعمة للرحم — وهو أمر شائع يُعرف بألم الرباط المستدير.',
    tipsJson: [
      'غيّري وضعيتك ببطء عند النهوض لتقليل ألم الأربطة',
      'حافظي على نشاط بدني معتدل كالمشي أو السباحة',
      'راجعي طبيبك إن كان الألم شديدًا أو مصحوبًا بأعراض أخرى',
    ],
    developmentJson: {
      points: [
        'تتراكم طبقة من الدهون تحت الجلد تساعد على تنظيم حرارة الجسم لاحقًا',
        'يبدأ الحبل السري بالنمو أقوى وأكثر سمكًا',
        'يتطور الهيكل العظمي الغضروفي إلى عظام أكثر صلابة',
      ],
    },
  },
  {
    weekNumber: 18,
    babySizeComparison: 'بحجم ثمرة الباذنجان الصغيرة',
    babyWeightGrams: 190,
    babyLengthCm: 14.2,
    bodyChangesText: 'هذا الأسبوع يشهد لدى كثير من الأمهات أول شعور واضح بحركة الجنين. قد تشعرين أيضًا بدوخة خفيفة أحيانًا بسبب تمدد الأوعية الدموية — النهوض ببطء يساعد على تجنبها.',
    tipsJson: [
      'راقبي بداية شعورك بحركة الجنين ودوّنيها إن رغبتِ',
      'انهضي ببطء من الجلوس أو الاستلقاء لتفادي الدوخة',
      'ناقشي مع طبيبك موعد فحص السونار التفصيلي القادم',
    ],
    developmentJson: {
      points: [
        'تكتمل الأذنان الداخليتان تقريبًا فيبدأ الجنين بسماع أصوات خافتة من داخل الرحم',
        'يتشكّل الحبل الشوكي بشكل كامل ويُحاط بغلاف واقٍ',
        'تنمو الأعضاء التناسلية بشكل أوضح، وقد تُكشف في السونار القادم',
      ],
    },
  },
  {
    weekNumber: 19,
    babySizeComparison: 'بحجم ثمرة المانجو الصغيرة',
    babyWeightGrams: 240,
    babyLengthCm: 15.3,
    bodyChangesText: 'قد تلاحظين ظهور خط داكن رفيع في منتصف البطن (خط الحمل)، وهو تغير هرموني طبيعي يختفي عادة بعد الولادة. حركة الجنين قد تصبح أوضح تدريجيًا.',
    tipsJson: [
      'استخدمي واقي شمس عند الخروج لتقليل تصبّغات الجلد',
      'تناولي غذاءً غنيًا بالكالسيوم لدعم نمو عظام طفلك',
      'خصصي وقتًا يوميًا للراحة ورفع قدميك إن شعرتِ بتورم خفيف',
    ],
    developmentJson: {
      points: [
        'تتشكّل طبقة واقية بيضاء على جلد الجنين تُعرف بالمادة الجبنية',
        'يستمر نمو الدماغ بوتيرة سريعة مع تطور مناطق الحواس الخمس',
        'تنمو الشعيرات الدقيقة (الزغب) التي تغطي جسم الجنين مؤقتًا',
      ],
    },
  },
  {
    weekNumber: 20,
    babySizeComparison: 'بحجم الموزة',
    babyWeightGrams: 300,
    babyLengthCm: 25.6,
    bodyChangesText: 'وصلتِ إلى منتصف الحمل! قد تشعرين الآن بحركة الجنين بوضوح أكبر (الرفرفة)، ويبدأ بروز البطن بالظهور جليًا لمعظم الأمهات.',
    tipsJson: [
      'فحص السونار التفصيلي (المورفولوجي) مهم جدًا في هذا الأسبوع',
      'راقبي وزنك ومعدل زيادته بانتظام مع طبيبك',
      'استمري بحركة خفيفة يومية كالمشي ما لم يُنصح بغير ذلك',
    ],
    developmentJson: {
      points: [
        'تتطور حاسة السمع بشكل كبير — قد يستجيب طفلك لصوتك الآن',
        'يبدأ نمو الشعر على فروة الرأس والأظافر على الأصابع',
        'يبتلع الجنين كميات صغيرة من السائل الأمينوسي تدريبًا لجهازه الهضمي',
      ],
    },
  },
  {
    weekNumber: 21,
    babySizeComparison: 'بحجم ثمرة الجزر الكبيرة',
    babyWeightGrams: 360,
    babyLengthCm: 26.7,
    bodyChangesText: 'حركة الجنين تصبح أوضح وأكثر انتظامًا الآن. قد تلاحظين أيضًا زيادة الشهية مع نمو الجنين السريع، وهذا أمر طبيعي ومتوقع في هذه المرحلة.',
    tipsJson: [
      'تناولي غذاءً متنوعًا وغنيًا بالبروتين لدعم النمو السريع لطفلك',
      'ابدئي بملاحظة أنماط حركة طفلك اليومية',
      'حافظي على نشاط بدني معتدل يناسب حالتك',
    ],
    developmentJson: {
      points: [
        'تنضج براعم التذوق ويستطيع الجنين تمييز مذاق السائل الأمينوسي',
        'يستمر نخاع العظم في إنتاج خلايا الدم بدل الكبد والطحال',
        'تصبح حركات الجنين أقوى وأكثر تناسقًا',
      ],
    },
  },
  {
    weekNumber: 22,
    babySizeComparison: 'بحجم ثمرة الكوسة الصغيرة',
    babyWeightGrams: 430,
    babyLengthCm: 27.8,
    bodyChangesText: 'قد يبدأ ظهور بعض علامات التمدد على البطن أو الفخذين مع استمرار نمو الرحم. ترطيب الجلد يوميًا يساعد على تخفيف الشعور بالحكة المصاحبة لها.',
    tipsJson: [
      'رطّبي بشرتك يوميًا بكريم أو زيت مناسب للحمل',
      'اشربي كمية كافية من الماء لتقليل الحكة الجلدية',
      'ارتدي أحذية مريحة مع بدء تغيّر مركز توازن جسمك',
    ],
    developmentJson: {
      points: [
        'تبدأ الحواجب والرموش بالظهور بوضوح أكبر',
        'يصبح الجلد أقل شفافية مع بدء تراكم الدهون تحته',
        'يستمر نمو الدماغ بسرعة كبيرة مع تكوّن ملايين الخلايا العصبية الجديدة',
      ],
    },
  },
  {
    weekNumber: 23,
    babySizeComparison: 'بحجم ثمرة الباذنجان الكبيرة',
    babyWeightGrams: 501,
    babyLengthCm: 28.9,
    bodyChangesText: 'قد تشعرين أحيانًا بانقباضات خفيفة وغير مؤلمة تُعرف بتقلصات براكستون هيكس — وهي تدريب طبيعي للرحم استعدادًا للولادة، وليست علامة على مخاض مبكر.',
    tipsJson: [
      'لا تقلقي من التقلصات الخفيفة غير المنتظمة، لكن راجعي الطبيب إن أصبحت متكررة أو مؤلمة',
      'استمري بمتابعة وزنك وضغط دمك بانتظام',
      'خصصي وقتًا يوميًا للاسترخاء وتمارين التنفس',
    ],
    developmentJson: {
      points: [
        'تنضج الرئتان أكثر وتبدأ بإنتاج مادة تساعد الحويصلات الهوائية على الانتفاخ لاحقًا',
        'يصبح جلد الجنين متجعدًا قليلًا لحين اكتمال طبقة الدهون تحته',
        'يستجيب الجنين للأصوات الخارجية وقد يتحرك استجابة لصوت مرتفع',
      ],
    },
  },
  {
    weekNumber: 24,
    babySizeComparison: 'بحجم كوز الذرة',
    babyWeightGrams: 600,
    babyLengthCm: 30.0,
    bodyChangesText: 'يُعتبر هذا الأسبوع مرحلة مهمة طبيًا، إذ تتحسّن فرص بقاء الجنين حال الولادة المبكرة جدًا بفضل الرعاية الطبية المتقدمة — وهذا لا يعني أن ولادتك ستكون مبكرة، بل هو معلومة طبية عامة فقط.',
    tipsJson: [
      'موعد فحص سكري الحمل (تحليل الجلوكوز) عادة يكون بين الآن والأسبوع 28',
      'راقبي أي تورم غير معتاد في القدمين أو اليدين وأخبري طبيبك به',
      'استمري بتناول وجبات متوازنة ومنتظمة',
    ],
    developmentJson: {
      points: [
        'يكتسب الجسم شكلًا أكثر تناسقًا مع تراكم الدهون تدريجيًا',
        'يفتح الجنين عينيه لأول مرة ويستطيع تمييز الضوء والظلام',
        'تستمر الرئتان في التطور استعدادًا للتنفس المستقل لاحقًا',
      ],
    },
  },
  {
    weekNumber: 25,
    babySizeComparison: 'بحجم ثمرة القرع الصغيرة',
    babyWeightGrams: 660,
    babyLengthCm: 34.6,
    bodyChangesText: 'قد تلاحظين زيادة التعرّق أو الشعور بالحرارة أكثر من المعتاد بسبب تسارع عملية الأيض في جسمك. آلام الظهر قد تصبح أكثر وضوحًا مع زيادة وزن الجنين.',
    tipsJson: [
      'ارتدي ملابس قطنية خفيفة تساعد على التهوية',
      'استخدمي وسادة داعمة أثناء النوم لتخفيف آلام الظهر',
      'تناولي أطعمة غنية بالحديد لتفادي فقر الدم',
    ],
    developmentJson: {
      points: [
        'تتكوّن الشعيرات الدموية الصغيرة تحت الجلد فيصبح لون بشرته ورديًا تدريجيًا',
        'يبدأ الجنين بتطوير نمط منتظم أكثر للنوم واليقظة',
        'تزداد قوة قبضة يد الجنين الصغيرة',
      ],
    },
  },
  {
    weekNumber: 26,
    babySizeComparison: 'بحجم رأس الخس',
    babyWeightGrams: 760,
    babyLengthCm: 35.6,
    bodyChangesText: 'قد تبدئين بالدخول في الثلث الثالث قريبًا. بعض الأمهات يلاحظن بداية تسرّب بسيط للسائل الأول من الثدي (اللبأ)، وهذا أمر طبيعي تمامًا وليس علامة على قرب الولادة.',
    tipsJson: [
      'استمري بمتابعة حركة الجنين اليومية وأخبري طبيبك بأي تغيّر ملحوظ',
      'ناقشي مع طبيبك حقنة الغلوبولين المناعي إن كانت فصيلة دمك سلبية (Rh-)',
      'ابدئي التفكير تدريجيًا في خطة الولادة التي تناسبك',
    ],
    developmentJson: {
      points: [
        'تفتح العينان بانتظام أكبر ويتطور رد فعل الجنين تجاه الضوء',
        'تتطور الرئتان بشكل ملحوظ استعدادًا لأولى مراحل التنفس',
        'يستمر نمو الدماغ بشكل سريع مع تزايد نشاطه الكهربائي',
      ],
    },
  },
  {
    weekNumber: 27,
    babySizeComparison: 'بحجم رأس القرنبيط',
    babyWeightGrams: 875,
    babyLengthCm: 36.6,
    bodyChangesText: 'أهلًا بكِ في الثلث الثالث من الحمل. قد تشعرين بضيق تنفس خفيف أحيانًا مع بدء ضغط الرحم المتنامي على الحجاب الحاجز، وهذا أمر شائع ومؤقت.',
    tipsJson: [
      'حافظي على وضعية جلوس مستقيمة تُسهّل عملية التنفس',
      'وزّعي وجباتك على كميات أصغر إن شعرتِ بامتلاء سريع',
      'استمري بحضور مواعيد المتابعة، فقد تصبح أكثر تكرارًا من الآن',
    ],
    developmentJson: {
      points: [
        'يستطيع الجنين الآن فتح عينيه وإغلاقهما بإرادته',
        'يتطور نمط تنفسي منتظم رغم أن الرئتين ما زالتا مملوءتين بالسائل',
        'يزداد وزن الدماغ ونشاطه بشكل ملحوظ هذا الأسبوع',
      ],
    },
  },
  {
    weekNumber: 28,
    babySizeComparison: 'بحجم ثمرة الشمام الصغيرة',
    babyWeightGrams: 1005,
    babyLengthCm: 37.6,
    bodyChangesText: 'قد تلاحظين ظهور دوالي خفيفة في الساقين أو تورمًا بسيطًا في القدمين مع نهاية اليوم — وهذا شائع في الثلث الثالث بسبب زيادة حجم الدم وضغط الرحم المتنامي.',
    tipsJson: [
      'ارفعي قدميك كلما استطعتِ لتخفيف التورم',
      'تجنبي الوقوف لفترات طويلة متواصلة',
      'راجعي طبيبك إن كان التورم مفاجئًا أو مصحوبًا بصداع شديد',
    ],
    developmentJson: {
      points: [
        'يبدأ الجنين بالتقلب رأسًا لأسفل استعدادًا تدريجيًا للولادة، وإن كان قد يغيّر وضعيته لاحقًا',
        'تنضج شبكية العين وتتطور القدرة على الرؤية الجزئية',
        'يتراكم مزيد من الدهون تحت الجلد فيكتسب الجسم ملمسًا أكثر نعومة',
      ],
    },
  },
  {
    weekNumber: 29,
    babySizeComparison: 'بحجم اليقطين الصغير',
    babyWeightGrams: 1153,
    babyLengthCm: 38.6,
    bodyChangesText: 'قد تشعرين بالإرهاق أكثر مع زيادة وزنك وضغط الرحم المتنامي. تكرار التبول قد يعود مجددًا، وهو أمر طبيعي مع اقتراب استقرار رأس الجنين في الحوض لاحقًا.',
    tipsJson: [
      'خصصي فترات راحة قصيرة متعددة على مدار يومك',
      'استمري بتمارين قاع الحوض الخفيفة إن نصحك طبيبك بذلك',
      'راقبي عدد ركلات طفلك اليومية بانتظام',
    ],
    developmentJson: {
      points: [
        'تنمو العضلات والرئتان بشكل مستمر استعدادًا للحياة خارج الرحم',
        'يستطيع الجنين تنظيم حرارة جسمه بشكل أفضل تدريجيًا',
        'تصبح حركات الرأس والأطراف أقوى وأكثر وضوحًا للأم',
      ],
    },
  },
  {
    weekNumber: 30,
    babySizeComparison: 'بحجم الملفوف',
    babyWeightGrams: 1319,
    babyLengthCm: 39.9,
    bodyChangesText: 'قد تشعرين بضيق في التنفس وآلام أسفل الظهر مع اقتراب الثلث الثالث من ذروته، وقد يصبح النوم بوضعية مريحة أكثر تحديًا مع كبر حجم البطن.',
    tipsJson: [
      'ابدئي بتحضير حقيبة الولادة تدريجيًا',
      'راقبي حركة الجنين يوميًا وأخبري طبيبك بأي تغيّر ملحوظ',
      'استخدمي وسائد إضافية لدعم ظهرك وبطنك أثناء النوم',
    ],
    developmentJson: {
      points: [
        'يستمر نمو الدماغ بوتيرة سريعة جدًا مع اقتراب موعد الولادة',
        'تكتمل معظم أعضاء الجسم وظيفيًا وتستمر بالنضج تدريجيًا',
        'يتراكم مزيد من الدهون تحت الجلد لدعم تنظيم الحرارة بعد الولادة',
      ],
    },
  },
  {
    weekNumber: 31,
    babySizeComparison: 'بحجم جوز الهند',
    babyWeightGrams: 1502,
    babyLengthCm: 41.1,
    bodyChangesText: 'قد يعود تكرار التبول بشكل ملحوظ مع بدء نزول رأس الجنين تدريجيًا نحو الحوض. الشعور بالإرهاق وصعوبة النوم المريح قد يزدادان مع كبر حجم البطن.',
    tipsJson: [
      'استخدمي وسائد متعددة لإيجاد وضعية نوم مريحة',
      'استمري بمواعيد المتابعة الطبية التي قد تصبح أسبوعية قريبًا',
      'ابدئي بالتعرف على علامات المخاض الحقيقية تدريجيًا',
    ],
    developmentJson: {
      points: [
        'يكتمل تطور الجهاز المناعي تدريجيًا استعدادًا للحياة خارج الرحم',
        'تصبح حركات الجنين محدودة أكثر بسبب ضيق المساحة داخل الرحم',
        'يستمر الدماغ في تكوين تشابكات عصبية جديدة بمعدل سريع',
      ],
    },
  },
  {
    weekNumber: 32,
    babySizeComparison: 'بحجم القرع الأخضر',
    babyWeightGrams: 1702,
    babyLengthCm: 42.4,
    bodyChangesText: 'قد تلاحظين تقلصات براكستون هيكس بشكل أكثر تكرارًا، وهي تدريب طبيعي للرحم. ضيق التنفس الخفيف والحرقة قد يستمران مع ضغط الرحم المتنامي على المعدة والحجاب الحاجز.',
    tipsJson: [
      'تناولي وجبات صغيرة ومتكررة لتخفيف حرقة المعدة',
      'تجنبي الاستلقاء مباشرة بعد الأكل',
      'راقبي حركة الجنين يوميًا بانتظام',
    ],
    developmentJson: {
      points: [
        'تتكامل أظافر اليدين تقريبًا وتصل إلى أطراف الأصابع',
        'تستمر الرئتان في النضج وإنتاج المادة الخافضة للتوتر السطحي',
        'يكتسب الجنين وزنًا بمعدل أسرع من أي مرحلة سابقة',
      ],
    },
  },
  {
    weekNumber: 33,
    babySizeComparison: 'بحجم ثمرة الأناناس',
    babyWeightGrams: 1918,
    babyLengthCm: 43.7,
    bodyChangesText: 'قد يزداد الشعور بثقل أسفل البطن وآلام الحوض مع استمرار نزول الجنين تدريجيًا. النوم قد يصبح أكثر تحديًا، وهذا أمر شائع في هذه المرحلة.',
    tipsJson: [
      'مارسي تمارين تنفس واسترخاء تساعدك على النوم',
      'حضّري تدريجيًا حقيبة الولادة إن لم تكوني فعلتِ بعد',
      'ناقشي مع طبيبك خطة الولادة التي تفضلينها',
    ],
    developmentJson: {
      points: [
        'تتقارب عظام الجمجمة دون أن تلتحم تمامًا، مما يسهّل المرور عبر قناة الولادة لاحقًا',
        'يصبح الجهاز العصبي أكثر نضجًا في التحكم بوظائف الجسم',
        'يستمر تراكم الدهون تحت الجلد فيبدو الجسم أكثر امتلاءً',
      ],
    },
  },
  {
    weekNumber: 34,
    babySizeComparison: 'بحجم ثمرة الشمام',
    babyWeightGrams: 2146,
    babyLengthCm: 45.0,
    bodyChangesText: 'قد تشعرين بضغط متزايد على الحوض والمثانة مع اقتراب استقرار الجنين في وضعية الولادة. تورم القدمين قد يزداد قليلًا خاصة في نهاية اليوم.',
    tipsJson: [
      'ارفعي قدميك كلما أمكن لتخفيف التورم',
      'تجنبي الملح الزائد في طعامك',
      'استمري بمتابعة عدد ركلات طفلك اليومية',
    ],
    developmentJson: {
      points: [
        'تنضج الرئتان بشكل شبه كامل استعدادًا للتنفس المستقل',
        'يتراجع الزغب (الشعر الدقيق) الذي كان يغطي جسم الجنين تدريجيًا',
        'يستقر كثير من الأجنة في وضعية الرأس لأسفل استعدادًا للولادة',
      ],
    },
  },
  {
    weekNumber: 35,
    babySizeComparison: 'بحجم بطيخة صغيرة',
    babyWeightGrams: 2383,
    babyLengthCm: 46.2,
    bodyChangesText: 'قد تلاحظين صعوبة أكبر في الحركة مع كبر حجم البطن، وربما يزداد الشعور بالحاجة للتبول المتكرر مع اقتراب رأس الجنين من الحوض أكثر.',
    tipsJson: [
      'ناقشي مع طبيبك تحليل البكتيريا العقدية (GBS) الذي يُجرى عادة في هذه الفترة',
      'استمري بالراحة الكافية وتجنّب الإجهاد الزائد',
      'راجعي مستلزمات المولود تدريجيًا إن لم تكوني جهزتِها بعد',
    ],
    developmentJson: {
      points: [
        'تنضج الكليتان بشكل كامل وتعملان بكفاءة جيدة',
        'يستمر الكبد في تطوير قدرته على معالجة الفضلات',
        'تصبح معظم الأعضاء الأساسية مكتملة النضج وظيفيًا',
      ],
    },
  },
  {
    weekNumber: 36,
    babySizeComparison: 'بحجم رأس الخس الروماني الكبير',
    babyWeightGrams: 2622,
    babyLengthCm: 47.4,
    bodyChangesText: 'قد تشعرين بخفة أكبر في التنفس إن نزل الجنين نحو الحوض (تُعرف هذه المرحلة بـ"الإسقاط")، لكن هذا قد يزيد الضغط على المثانة والحوض في المقابل.',
    tipsJson: [
      'تعرّفي على علامات المخاض الحقيقية والفرق بينها وبين براكستون هيكس',
      'تأكدي من جاهزية حقيبة الولادة ووثائقك الطبية',
      'ناقشي مع طبيبك رقم الطوارئ ومتى يجب التوجه للمستشفى',
    ],
    developmentJson: {
      points: [
        'يُعتبر الجنين الآن قريبًا جدًا من مرحلة الاكتمال الكامل للنمو',
        'تتكامل منعكسات المص والبلع والتنفس استعدادًا للولادة',
        'يستمر تراكم الدهون تحت الجلد ليساعد على تنظيم حرارة الجسم بعد الولادة',
      ],
    },
  },
  {
    weekNumber: 37,
    babySizeComparison: 'بحجم القرع العسلي',
    babyWeightGrams: 2859,
    babyLengthCm: 48.6,
    bodyChangesText: 'يُعتبر طفلك من هذا الأسبوع "مكتمل النمو مبكرًا" طبيًا. قد تلاحظين نزول السدادة المخاطية أو تقلصات أكثر تكرارًا مع اقتراب موعد الولادة.',
    tipsJson: [
      'راقبي أي علامات تشير لبدء المخاض: تقلصات منتظمة، نزول ماء الرأس، أو نزول دم خفيف',
      'حافظي على هدوئك وثقي بجسمك واستعداده الطبيعي للولادة',
      'استمري بمواعيد المتابعة الأسبوعية مع طبيبك',
    ],
    developmentJson: {
      points: [
        'تكتمل معظم الأعضاء الحيوية نموًا ووظيفيًا',
        'يستمر الدماغ والجهاز العصبي في النضج حتى بعد الولادة',
        'يتخذ الجنين عادة وضعية الاستعداد النهائية للولادة',
      ],
    },
  },
  {
    weekNumber: 38,
    babySizeComparison: 'بحجم الكرنب الأحمر',
    babyWeightGrams: 3083,
    babyLengthCm: 49.8,
    bodyChangesText: 'قد يصبح الانتظار مليئًا بمشاعر متضاربة بين الترقب والتوتر، وهذا طبيعي تمامًا. حركة الجنين قد تشعرين بها بشكل مختلف قليلًا مع ضيق المساحة، لكنها يجب أن تبقى منتظمة.',
    tipsJson: [
      'استمري بمراقبة حركة الجنين وأخبري طبيبك فورًا إن قلّت بشكل ملحوظ',
      'خذي قسطًا وافرًا من الراحة استعدادًا للمخاض',
      'حضّري نفسك ذهنيًا وتحدثي مع من حولك عن مخاوفك إن وُجدت',
    ],
    developmentJson: {
      points: [
        'يُعتبر الجنين مكتمل النمو تقريبًا وجاهزًا للحياة خارج الرحم',
        'تستمر طبقة الدهون تحت الجلد بالتزايد لإعطاء الجسم شكله النهائي',
        'يفرز الجسم مادة تُعرف بالعقي وهي أول برازٍ للمولود بعد الولادة',
      ],
    },
  },
  {
    weekNumber: 39,
    babySizeComparison: 'بحجم بطيخة متوسطة',
    babyWeightGrams: 3288,
    babyLengthCm: 50.7,
    bodyChangesText: 'طفلك مكتمل النمو تمامًا الآن وجاهز للقدوم في أي وقت. قد تشعرين بثقل كبير وصعوبة في الحركة، وهذا طبيعي جدًا في الأيام الأخيرة من الحمل.',
    tipsJson: [
      'تأكدي أن حقيبة الولادة جاهزة بالكامل عند الباب',
      'حافظي على تواصل يومي حول حركة طفلك مع من يرافقك',
      'لا تترددي في التوجه للمستشفى فور ملاحظة علامات المخاض',
    ],
    developmentJson: {
      points: [
        'اكتمل نمو جميع الأعضاء ووظائفها بشكل كامل تقريبًا',
        'يستمر الجهاز المناعي في اكتساب أجسام مضادة من الأم عبر المشيمة',
        'يستقر الجنين غالبًا في وضعية الولادة النهائية',
      ],
    },
  },
  {
    weekNumber: 40,
    babySizeComparison: 'بحجم بطيخة كبيرة',
    babyWeightGrams: 3462,
    babyLengthCm: 51.2,
    bodyChangesText: 'وصلتِ إلى الأسبوع الأربعين — تاريخ الولادة المتوقَّع، لكن من الطبيعي جدًا أن تبدأ الولادة قبله بأسبوعين أو بعده بأسبوع تقريبًا. جسمك يعرف متى يكون الوقت المناسب.',
    tipsJson: [
      'حافظي على هدوئك، فتجاوز التاريخ المتوقع بأيام قليلة أمر شائع جدًا',
      'استمري بمتابعة حركة الجنين والتواصل مع طبيبك بانتظام',
      'ثقي بجسمك واستعدادك، ولادتك أصبحت وشيكة',
    ],
    developmentJson: {
      points: [
        'يُعتبر طفلك مكتمل النمو تمامًا وجاهزًا للحياة خارج الرحم',
        'اكتملت جميع الأعضاء الحيوية ووظائفها الأساسية',
        'ينتظر جسمك الإشارات الهرمونية الطبيعية التي تبدأ المخاض',
      ],
    },
  },
];

// dayOfWeek بنفس ترميز JavaScript Date.getDay(): 0=الأحد ... 6=السبت
const WEEKLY_MEALS_SEED: {
  dayOfWeek: number;
  mealType: MealType;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}[] = [
  // بلا أسعار بطلب صريح (price: 0 لكل الوجبات) — واجهة بطاقة الوجبة (MealItemRow) لا تعرض
  // السعر أصلًا، لكن سلة الطلب (MealCartPanel) لا تزال تعرض المجموع من هذا الحقل، فستظهر
  // "0 دج" هناك؛ هذا انعكاس مباشر ومقصود لطلب "بدون أسعار" لا خطأ
  {
    dayOfWeek: 0, mealType: MealType.lunch,
    name: 'صدر دجاج مشوي بالأعشاب + أرز بالخضر + سلطة مشكلة + برتقال',
    description: 'صدر دجاج مشوي متبّل بالأعشاب الطازجة، مع أرز بالخضر وسلطة مشكلة وحبة برتقال.',
    price: 0, imageUrl: 'https://images.unsplash.com/photo-1762631934518-f75e233413ca?w=600&q=80&auto=format&fit=crop',
  },
  {
    dayOfWeek: 0, mealType: MealType.dinner,
    name: 'شوربة خضر + عجة بالخضر + خبز كامل + ياغورت طبيعي',
    description: 'شوربة خضروات دافئة، عجة بالخضر، خبز كامل الحبوب، وكوب ياغورت طبيعي.',
    price: 0, imageUrl: 'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=600&q=80&auto=format&fit=crop',
  },
  {
    dayOfWeek: 1, mealType: MealType.lunch,
    name: 'مرقة عدس بالدجاج + خبز كامل + سلطة جزر وذرة + تفاحة',
    description: 'مرقة عدس مطهية بقطع الدجاج، مع خبز كامل الحبوب وسلطة جزر وذرة وحبة تفاح.',
    price: 0, imageUrl: 'https://images.unsplash.com/photo-1544378730-5e409d0e649e?w=600&q=80&auto=format&fit=crop',
  },
  {
    dayOfWeek: 1, mealType: MealType.dinner,
    name: 'سلطة تونة مع الذرة والخس + خبز كامل + لبن',
    description: 'سلطة تونة طازجة مع الذرة والخس، خبز كامل الحبوب، وكوب لبن.',
    price: 0, imageUrl: 'https://images.unsplash.com/photo-1635264685671-739e75e73e0f?w=600&q=80&auto=format&fit=crop',
  },
  {
    dayOfWeek: 2, mealType: MealType.lunch,
    name: 'طاجين كفتة بالصلصة والبطاطا + بطاطا في الفرن + سلطة موسمية + فاكهة الموسم',
    description: 'طاجين كفتة اللحم المفروم بصلصة الطماطم والبطاطا، مع بطاطا مشوية بالفرن وسلطة وفاكهة موسمية.',
    price: 0, imageUrl: 'https://images.unsplash.com/photo-1517314626714-ac1b9a16515e?w=600&q=80&auto=format&fit=crop',
  },
  {
    dayOfWeek: 2, mealType: MealType.dinner,
    name: 'حساء الشعير + جبن قليل الدسم + خبز كامل + تمرتان',
    description: 'حساء الشعير الدافئ، مع جبن قليل الدسم وخبز كامل الحبوب وتمرتين.',
    price: 0, imageUrl: 'https://images.unsplash.com/photo-1708782340354-96cdbd9f70d6?w=600&q=80&auto=format&fit=crop',
  },
  {
    dayOfWeek: 3, mealType: MealType.lunch,
    name: 'كسكس بالخضر والدجاج + سلطة + برتقال',
    description: 'كسكس تقليدي بالخضروات الموسمية وقطع الدجاج، مع سلطة وحبة برتقال.',
    price: 0, imageUrl: 'https://images.unsplash.com/photo-1563897539633-7374c276c212?w=600&q=80&auto=format&fit=crop',
  },
  {
    dayOfWeek: 3, mealType: MealType.dinner,
    name: 'سلطة بطاطا مسلوقة مع البيض والقدونس + لبن',
    description: 'سلطة بطاطا مسلوقة مع البيض المسلوق والقدونس الطازج، مع كوب لبن.',
    price: 0, imageUrl: 'https://images.unsplash.com/photo-1620418025834-f4379baf1de9?w=600&q=80&auto=format&fit=crop',
  },
  {
    dayOfWeek: 4, mealType: MealType.lunch,
    name: 'سمك مشوي + أرز بالخضر + سلطة خيار وطماطم + إجاص',
    description: 'سمك طازج مشوي، مع أرز بالخضر وسلطة خيار وطماطم وحبة إجاص.',
    price: 0, imageUrl: 'https://images.unsplash.com/photo-1600699899970-b1c9fadd8f9e?w=600&q=80&auto=format&fit=crop',
  },
  {
    dayOfWeek: 4, mealType: MealType.dinner,
    name: 'شوربة قرع (يقطين) + خبز طازج + خبز كامل + ياغورت طبيعي',
    description: 'شوربة قرع دافئة وكريمية، مع خبز طازج وخبز كامل الحبوب وكوب ياغورت طبيعي.',
    price: 0, imageUrl: 'https://images.unsplash.com/photo-1689860892307-7db54ab276ba?w=600&q=80&auto=format&fit=crop',
  },
  {
    dayOfWeek: 5, mealType: MealType.lunch,
    name: 'لوبيا باللحم + سلطة خضراء + فاكهة الموسم',
    description: 'لوبيا بيضاء مطهية بقطع اللحم، مع سلطة خضراء وفاكهة موسمية.',
    price: 0, imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&q=80&auto=format&fit=crop',
  },
  {
    dayOfWeek: 5, mealType: MealType.dinner,
    name: 'حريرة خفيفة + بيض مسلوق + لبن',
    description: 'حريرة خفيفة، مع بيضة مسلوقة وكوب لبن.',
    price: 0, imageUrl: 'https://images.unsplash.com/photo-1559561723-c3f4195835db?w=600&q=80&auto=format&fit=crop',
  },
  {
    dayOfWeek: 6, mealType: MealType.lunch,
    name: 'طاجين دجاج بالخضر الموسمية + برغل أو فريك + سلطة + تمرتين',
    description: 'طاجين دجاج بالخضروات الموسمية، مع برغل أو فريك وسلطة وتمرتين.',
    price: 0, imageUrl: 'https://images.unsplash.com/photo-1759679134771-835a874351fe?w=600&q=80&auto=format&fit=crop',
  },
  {
    dayOfWeek: 6, mealType: MealType.dinner,
    name: 'حساء خضر + ساندويتش دجاج صحي بخبز كامل + ياغورت طبيعي',
    description: 'حساء خضر دافئ، مع ساندويتش دجاج صحي بخبز كامل الحبوب وكوب ياغورت طبيعي.',
    price: 0, imageUrl: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=600&q=80&auto=format&fit=crop',
  },
];

const HOME_SERVICE_CLEANING_IMAGE = 'https://images.unsplash.com/photo-1758273238415-01ec03d9ef27?w=600&q=80&auto=format&fit=crop';
const HOME_SERVICE_COOKING_IMAGE = 'https://images.unsplash.com/photo-1758522484068-4ba2b78add9e?w=600&q=80&auto=format&fit=crop';
// كانت هذه الخدمة تستخدم /services/health.jpg (صورة استشارة طبية بجهاز لوحي، مخصَّصة فعليًا
// لبطاقة "المرافقة الصحية" في MobileHomeContent.tsx) — لا تُظهر ممرضة حقيقية تعتني بمولود في
// المنزل كما يقتضي وصف هذه الخدمة تحديدًا، فاستُبدلت بصورة ممرضة حقيقية تحمل مولودًا
const HOME_SERVICE_CARE_IMAGE = 'https://images.unsplash.com/photo-1701557774749-2f2c603c7995?w=600&q=80&auto=format&fit=crop';

const HOME_SERVICES_SEED: { name: string; description: string; basePrice: number; category: string; imageUrl: string }[] = [
  {
    name: 'تنظيف المنزل',
    description: 'تنظيف شامل لمنزلك يشمل الغرف والمطبخ والحمامات، بطاقم موثوق ومتحقق منه',
    basePrice: 2500,
    category: 'تنظيف',
    imageUrl: HOME_SERVICE_CLEANING_IMAGE,
  },
  {
    name: 'تنظيف عميق',
    description: 'تنظيف عميق يشمل السجاد والستائر والزوايا الصعبة، مناسب قبل استقبال المولود',
    basePrice: 4500,
    category: 'تنظيف',
    imageUrl: HOME_SERVICE_CLEANING_IMAGE,
  },
  {
    name: 'طبخ منزلي',
    description: 'طاهية منزلية تحضّر وجبات صحية طازجة في منزلك حسب احتياجاتك الغذائية',
    basePrice: 3000,
    category: 'طبخ',
    imageUrl: HOME_SERVICE_COOKING_IMAGE,
  },
  {
    name: 'رعاية بعد الولادة',
    description: 'مساعدة منزلية متخصصة لدعم الأم خلال فترة النفاس: رعاية المولود ومهام منزلية خفيفة',
    basePrice: 5000,
    category: 'رعاية',
    imageUrl: HOME_SERVICE_CARE_IMAGE,
  },
];

const PRODUCTS_SEED: {
  name: string;
  description: string;
  price: number;
  category: string;
  stockQuantity: number;
  imageUrl: string;
}[] = [
  // عناية بالأم
  { name: 'كريم علاج تشققات الحمل', description: 'كريم مرطب يقلل من تشققات الجلد خلال الحمل وبعد الولادة', price: 1800, category: 'عناية بالأم', stockQuantity: 25, imageUrl: 'https://images.unsplash.com/photo-1638609927040-8a7e97cd9d6a?w=600&q=80&auto=format&fit=crop' },
  { name: 'وسادة دعم الحمل', description: 'وسادة كبيرة على شكل U لدعم الظهر والبطن أثناء النوم', price: 4500, category: 'عناية بالأم', stockQuantity: 8, imageUrl: 'https://images.unsplash.com/photo-1570786240066-c0d753711cfe?w=600&q=80&auto=format&fit=crop' },
  { name: 'حزام دعم الظهر للحوامل', description: 'حزام طبي يخفف الضغط عن أسفل الظهر خلال الحمل المتقدم', price: 3200, category: 'عناية بالأم', stockQuantity: 2, imageUrl: 'https://images.unsplash.com/photo-1515775538093-d2d95c5ee4f5?w=600&q=80&auto=format&fit=crop' },
  { name: 'زيت تدليك طبيعي للبطن', description: 'زيت طبيعي بخلاصة اللوز لترطيب البطن ومنع التشققات', price: 1200, category: 'عناية بالأم', stockQuantity: 40, imageUrl: 'https://images.unsplash.com/photo-1671492246169-cdd6305870a0?w=600&q=80&auto=format&fit=crop' },
  { name: 'حمالة صدر للرضاعة', description: 'حمالة قطنية مريحة بفتحات سهلة للرضاعة الطبيعية', price: 2200, category: 'عناية بالأم', stockQuantity: 15, imageUrl: 'https://images.unsplash.com/photo-1694290340663-65804773ce7a?w=600&q=80&auto=format&fit=crop' },
  { name: 'وسادة الرضاعة', description: 'وسادة مريحة تدعم وضعية الطفل أثناء الرضاعة الطبيعية', price: 3500, category: 'عناية بالأم', stockQuantity: 1, imageUrl: 'https://images.unsplash.com/photo-1676030789370-5298ab95ecab?w=600&q=80&auto=format&fit=crop' },
  { name: 'كريم علاج الحلمات', description: 'كريم طبيعي آمن لعلاج تشقق الحلمات أثناء الرضاعة', price: 950, category: 'عناية بالأم', stockQuantity: 30, imageUrl: 'https://images.unsplash.com/photo-1638609927252-9982beed7af8?w=600&q=80&auto=format&fit=crop' },
  // مستلزمات الطفل
  { name: 'حفاضات مقاس 1 (علبة)', description: 'علبة حفاضات فائقة النعومة للمواليد الجدد، مقاس 1', price: 1600, category: 'مستلزمات الطفل', stockQuantity: 50, imageUrl: 'https://images.unsplash.com/photo-1584839404042-8bc21d240e91?w=600&q=80&auto=format&fit=crop' },
  { name: 'مناديل مبللة (عبوة)', description: 'مناديل مبللة خالية من الكحول والعطور، مناسبة لبشرة الرضيع', price: 450, category: 'مستلزمات الطفل', stockQuantity: 100, imageUrl: 'https://images.unsplash.com/photo-1706524077391-12206f155e94?w=600&q=80&auto=format&fit=crop' },
  { name: 'زجاجة رضاعة 250 مل', description: 'زجاجة رضاعة خالية من BPA بحلمة تحاكي شكل الثدي الطبيعي', price: 900, category: 'مستلزمات الطفل', stockQuantity: 20, imageUrl: 'https://images.unsplash.com/photo-1645273474679-87b95586294e?w=600&q=80&auto=format&fit=crop' },
  { name: 'مقياس حرارة رقمي للأطفال', description: 'مقياس حرارة رقمي سريع ودقيق وآمن للاستخدام مع الرضع', price: 1500, category: 'مستلزمات الطفل', stockQuantity: 12, imageUrl: 'https://images.unsplash.com/photo-1609725236589-d987ffc8133a?w=600&q=80&auto=format&fit=crop' },
  { name: 'جهاز تعقيم الرضاعات بالبخار', description: 'يعقّم حتى 6 زجاجات رضاعة في دورة واحدة بالبخار', price: 6500, category: 'مستلزمات الطفل', stockQuantity: 5, imageUrl: 'https://images.unsplash.com/photo-1487168791452-17942644e6f6?w=600&q=80&auto=format&fit=crop' },
  { name: 'بطانية استقبال المولود', description: 'بطانية قطنية ناعمة وخفيفة لاستقبال المولود الجديد', price: 2000, category: 'مستلزمات الطفل', stockQuantity: 18, imageUrl: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=600&q=80&auto=format&fit=crop' },
  { name: 'كرسي هزاز للأطفال', description: 'كرسي هزاز مريح بحركة تلقائية خفيفة لتهدئة الرضيع', price: 8500, category: 'مستلزمات الطفل', stockQuantity: 3, imageUrl: 'https://images.unsplash.com/photo-1721739225034-a6732d0fd819?w=600&q=80&auto=format&fit=crop' },
];

// حسابات أمهات تجريبية خفيفة (لا ترتبط بحمل أو عائلة) خصّيصًا لتملك آراء تجريبية —
// لا يوجد في seed.ts أي مستخدم بدور mother حاليًا لأن الأمهات الفعليات يُنشأن عبر التسجيل
const TESTIMONIALS_SEED: {
  phone: string;
  wilaya: string;
  displayName: string;
  content: string;
  rating: number;
}[] = [
  {
    phone: '0500000101',
    wilaya: 'الجزائر العاصمة',
    displayName: 'سلمى',
    content: 'التطبيق رافقني من أول يوم في الحمل إلى فترة النفاس، المتابعة الأسبوعية والتذكيرات ساعدتني كثيرًا',
    rating: 5,
  },
  {
    phone: '0500000102',
    wilaya: 'وهران',
    displayName: 'أمينة',
    content: 'أحببت خاصية الاستشارات عن بعد، تحدثت مع أخصائية نفسية دون الحاجة للتنقل وكان الحجز سهلًا جدًا',
    rating: 5,
  },
  {
    phone: '0500000103',
    wilaya: 'قسنطينة',
    displayName: 'نور الهدى',
    content: 'خدمة الوجبات الأسبوعية كانت مفيدة جدًا في الأسابيع الأولى بعد الولادة، وفّرت عليّ وقتًا ومجهودًا كبيرين',
    rating: 4,
  },
  {
    phone: '0500000104',
    wilaya: 'سطيف',
    displayName: 'خديجة',
    content: 'الحاسبة والمحتوى الأسبوعي عن تطور الحمل ساعداني على فهم كل مرحلة، تطبيق موثوق وباللغة العربية',
    rating: 5,
  },
  {
    phone: '0500000105',
    wilaya: 'عنابة',
    displayName: 'ياسمين',
    content: 'التذكيرات بمواعيد الأدوية والفحوصات كانت دقيقة، وخدمة الدعم استجابت بسرعة عند استفساري',
    rating: 4,
  },
];

// الدولا الرقمية: محتوى ثابت مكتوب مسبقًا فقط — بلا أي نموذج لغوي أو استدعاء خارجي.
// key/relatedKeys محليان لربط الأسئلة ببعضها وقت الزرع فقط، لا يُخزَّنان في قاعدة البيانات كما هما؛
// يُحوَّل relatedKeys إلى معرّفات حقيقية (relatedEntryIds) بعد إنشاء كل الأسئلة في تمريرة ثانية.
const FAQ_CATEGORIES_SEED: { key: string; nameAr: string; iconName: string; displayOrder: number }[] = [
  { key: 'pregnancy', nameAr: 'الحمل', iconName: 'HeartPulse', displayOrder: 1 },
  { key: 'nutrition', nameAr: 'التغذية', iconName: 'Apple', displayOrder: 2 },
  { key: 'birth', nameAr: 'الولادة', iconName: 'Sparkles', displayOrder: 3 },
  { key: 'postpartum', nameAr: 'النفاس', iconName: 'Moon', displayOrder: 4 },
  { key: 'breastfeeding', nameAr: 'الرضاعة', iconName: 'Milk', displayOrder: 5 },
  { key: 'baby', nameAr: 'الطفل', iconName: 'Baby', displayOrder: 6 },
];

const FAQ_ENTRIES_SEED: {
  key: string;
  categoryKey: string;
  questionAr: string;
  answerAr: string;
  displayOrder: number;
  relatedKeys: string[];
}[] = [
  // الحمل
  {
    key: 'p1',
    categoryKey: 'pregnancy',
    questionAr: 'ما أعراض الحمل الشائعة في الأشهر الأولى؟',
    answerAr:
      'من الطبيعي أن تشعري في الأشهر الأولى بالتعب والإرهاق، وغثيان خاصة في الصباح، وحساسية تجاه بعض الروائح، وتغيّرات في الثدي، وحاجة متكررة للتبول. تختلف هذه الأعراض في شدتها ومدتها من امرأة لأخرى، وتخف غالبًا مع بداية الشهر الرابع. إن شعرتِ أن الأعراض شديدة جدًا وتمنعك من الأكل أو الشرب، من الأفضل استشارة طبيبتك.',
    displayOrder: 1,
    relatedKeys: ['p2', 'p7', 'n3'],
  },
  {
    key: 'p2',
    categoryKey: 'pregnancy',
    questionAr: 'هل الغثيان الصباحي طبيعي؟',
    answerAr:
      'نعم، غثيان الحمل من أكثر الأعراض شيوعًا ويصيب أكثر من نصف الحوامل، وقد يحدث في أي وقت من اليوم رغم اسمه. يبدأ عادة في الأسبوع السادس ويخف تدريجيًا مع نهاية الثلث الأول من الحمل. تناول وجبات صغيرة متكررة بدل الوجبات الكبيرة قد يخفف منه. إن استمر بشدة ومنعك من شرب السوائل، يُفضّل مراجعة طبيبتك لتجنّب الجفاف.',
    displayOrder: 2,
    relatedKeys: ['p1', 'n3', 'n1'],
  },
  {
    key: 'p3',
    categoryKey: 'pregnancy',
    questionAr: 'ما الذي يُمنع أثناء الحمل؟',
    answerAr:
      'بشكل عام يُنصح بتجنب التدخين والكحول تمامًا أثناء الحمل، وتقليل الكافيين، وتجنّب الأطعمة النيئة أو غير المطهوة جيدًا مثل بعض أنواع الجبن واللحوم النيئة. يُفضّل أيضًا تجنّب الأدوية دون استشارة الطبيبة، حتى الأدوية البسيطة. قد تختلف كل حالة حسب وضعك الصحي، لذا يبقى السؤال المباشر لطبيبتك المتابعة لحملك هو الأدق.',
    displayOrder: 3,
    relatedKeys: ['n1', 'n5'],
  },
  {
    key: 'p4',
    categoryKey: 'pregnancy',
    questionAr: 'هل يمكنني ممارسة الرياضة أثناء الحمل؟',
    answerAr:
      'نعم، الرياضة الخفيفة إلى المعتدلة مفيدة غالبًا أثناء الحمل مثل المشي والسباحة وتمارين التمدد المخصصة للحوامل، وتساعد على تحسين المزاج والنوم وتخفيف آلام الظهر. يُفضّل تجنّب الرياضات القوية أو التي فيها خطر السقوط أو الاصطدام. من المهم دائمًا استشارة طبيبتك قبل بدء أي برنامج رياضي جديد للتأكد أنه مناسب لحالتك.',
    displayOrder: 4,
    relatedKeys: ['pp5', 'p1'],
  },
  {
    key: 'p5',
    categoryKey: 'pregnancy',
    questionAr: 'كم عدد الفحوصات الطبية اللازمة خلال الحمل؟',
    answerAr:
      'يختلف عدد الزيارات حسب توصية طبيبتك وحالتك الصحية، لكن غالبًا تكون شهرية في البداية، ثم كل أسبوعين في الثلث الثاني، وأسبوعية في الشهر الأخير. تشمل هذه الزيارات فحوصات دم وسونار دوري لمتابعة نمو الجنين وصحتك. الالتزام بمواعيد المتابعة يساعد على اكتشاف أي مشكلة مبكرًا والاطمئنان على سير الحمل.',
    displayOrder: 5,
    relatedKeys: ['p7'],
  },
  {
    key: 'p6',
    categoryKey: 'pregnancy',
    questionAr: 'هل السفر آمن أثناء الحمل؟',
    answerAr:
      'غالبًا يكون السفر آمنًا في الثلث الثاني من الحمل خاصة، بينما يُفضّل الحذر أكثر في الأشهر الأولى والأخيرة. عند السفر بالطائرة تأكدي من الحركة كل فترة لتنشيط الدورة الدموية وشرب كمية كافية من الماء. كل حالة حمل مختلفة، فمن الأفضل دائمًا استشارة طبيبتك قبل التخطيط لأي رحلة، خاصة إن كانت طويلة أو لوجهة بعيدة.',
    displayOrder: 6,
    relatedKeys: ['p1', 'p5'],
  },
  {
    key: 'p7',
    categoryKey: 'pregnancy',
    questionAr: 'متى أشعر بحركة الجنين لأول مرة؟',
    answerAr:
      'تبدأ أغلب الحوامل بالشعور بحركة الجنين الأولى بين الأسبوعين 18 و22 من الحمل، وقد تشعر الحامل بحملها الثاني أو الثالث بحركة أبكر من ذلك أحيانًا. تكون الحركة في البداية خفيفة أشبه بخفقان أو فقاقيع، ثم تصبح أوضح مع تقدم الحمل. إن لاحظتِ تراجعًا ملحوظًا في حركة الجنين بعد أن اعتدتِ الشعور بها بانتظام، تواصلي مع طبيبتك فورًا للاطمئنان.',
    displayOrder: 7,
    relatedKeys: ['p1', 'pp1'],
  },
  // التغذية
  {
    key: 'n1',
    categoryKey: 'nutrition',
    questionAr: 'ما الأطعمة التي يجب تجنبها أثناء الحمل؟',
    answerAr:
      'يُفضّل تجنّب الأسماك عالية الزئبق، واللحوم والبيض النيئين أو غير المطهوين جيدًا، والجبن غير المبستر، لتقليل خطر التسمم الغذائي. كما يُنصح بغسل الخضروات والفواكه جيدًا قبل الأكل. إن كان لديك أي حساسية غذائية معروفة أو نظام غذائي خاص، من الأفضل مناقشته مع طبيبتك أو أخصائية التغذية لضمان حصولك على تغذية متوازنة وآمنة.',
    displayOrder: 1,
    relatedKeys: ['p3', 'n2'],
  },
  {
    key: 'n2',
    categoryKey: 'nutrition',
    questionAr: 'هل أحتاج لفيتامينات خاصة أثناء الحمل؟',
    answerAr:
      'غالبًا ما تنصح الطبيبات بمكملات مثل حمض الفوليك والحديد وفيتامين د خلال الحمل، لأن الاحتياج لهذه العناصر يزداد لدعم نمو الجنين. النوع والجرعة المناسبة يختلفان من حالة لأخرى حسب نتائج فحوصاتك، لذا لا يُنصح بتناول أي مكمل دون وصفة طبيبتك المتابعة لحملك، فهي الأقدر على تحديد ما يناسبك.',
    displayOrder: 2,
    relatedKeys: ['n6', 'n1'],
  },
  {
    key: 'n3',
    categoryKey: 'nutrition',
    questionAr: 'كيف أتعامل مع الغثيان وفقدان الشهية؟',
    answerAr:
      'تناول وجبات صغيرة ومتكررة بدل ثلاث وجبات كبيرة يساعد كثيرًا في تخفيف الغثيان، وكذلك تجنّب الروائح القوية والأطعمة الدسمة. حاولي شرب السوائل ببطء بين الوجبات لا معها مباشرة. إن كان فقدان الشهية شديدًا ومستمرًا ويؤثر على وزنك، من المهم إخبار طبيبتك لمتابعة الأمر عن قرب.',
    displayOrder: 3,
    relatedKeys: ['p2', 'n4'],
  },
  {
    key: 'n4',
    categoryKey: 'nutrition',
    questionAr: 'كم يجب أن يزيد وزني أثناء الحمل؟',
    answerAr:
      'تختلف الزيادة الموصى بها حسب وزنك قبل الحمل، لكنها تتراوح غالبًا بين 11 و16 كيلوغرامًا لمن كان وزنها طبيعيًا قبل الحمل. الأهم من الرقم نفسه هو أن تكون الزيادة تدريجية ومنتظمة لا مفاجئة. طبيبتك هي الأنسب لمتابعة وزنك بما يتناسب مع حالتك الخاصة في كل زيارة.',
    displayOrder: 4,
    relatedKeys: ['n2', 'p5'],
  },
  {
    key: 'n5',
    categoryKey: 'nutrition',
    questionAr: 'هل الكافيين مسموح أثناء الحمل؟',
    answerAr:
      'يُنصح عمومًا بتقليل الكافيين إلى كمية محدودة يوميًا (ما يعادل كوبًا أو كوبين من القهوة تقريبًا)، لأن الإفراط فيه قد يرتبط ببعض المخاطر. يشمل ذلك القهوة والشاي وبعض المشروبات الغازية والشوكولاتة. إن كنتِ معتادة على كميات كبيرة منه، فالتقليل التدريجي أسهل من التوقف المفاجئ، ويمكنك دائمًا سؤال طبيبتك عن الكمية المناسبة لحالتك.',
    displayOrder: 5,
    relatedKeys: ['p3', 'n2'],
  },
  {
    key: 'n6',
    categoryKey: 'nutrition',
    questionAr: 'ما أهمية الحديد وحمض الفوليك؟',
    answerAr:
      'حمض الفوليك مهم جدًا خاصة في الأشهر الأولى لأنه يساعد في تكوّن الجهاز العصبي للجنين بشكل سليم، بينما يساعد الحديد على إنتاج الدم الكافي لكِ وللجنين ويقي من فقر الدم أثناء الحمل. تجدينهما في مصادر مثل الخضروات الورقية والبقوليات واللحوم، وقد تحتاجين مكملات إضافية حسب فحوصاتك، وهذا ما تحدده طبيبتك المتابعة لحالتك.',
    displayOrder: 6,
    relatedKeys: ['n2', 'n1'],
  },
  {
    key: 'n7',
    categoryKey: 'nutrition',
    questionAr: 'هل الصيام آمن أثناء الحمل؟',
    answerAr:
      'يختلف الأمر من حامل لأخرى حسب صحتها العامة ومرحلة الحمل ونوع الحمل نفسه، فبعض الحوامل يستطعن الصيام دون مشاكل بينما قد يكون غير مناسب لأخريات في حالات معينة. الأهم هو عدم اتخاذ القرار بمفردك، بل مناقشته مع طبيبتك قبل الصيام لتقييم حالتك الصحية والتأكد أن ذلك آمن لكِ ولجنينك.',
    displayOrder: 7,
    relatedKeys: ['n4', 'p5'],
  },
  // الولادة
  {
    key: 'b1',
    categoryKey: 'birth',
    questionAr: 'ما علامات بداية المخاض؟',
    answerAr:
      'من أبرز علامات بداية المخاض الحقيقي انقباضات منتظمة تزداد قوة وتقاربًا مع الوقت ولا تهدأ بالراحة، وقد يرافقها نزول ماء الرأس أو خروج إفرازات مخاطية ممزوجة بدم خفيف. قد تشعرين أيضًا بألم أسفل الظهر يمتد للأمام. إن لاحظتِ أيًا من هذه العلامات، أو كان لديكِ أي شك، تواصلي فورًا مع طبيبتك أو توجهي إلى المستشفى لتقييم حالتك.',
    displayOrder: 1,
    relatedKeys: ['b2', 'b3'],
  },
  {
    key: 'b2',
    categoryKey: 'birth',
    questionAr: 'متى أذهب إلى المستشفى؟',
    answerAr:
      'غالبًا يُنصح بالتوجه إلى المستشفى عندما تصبح الانقباضات منتظمة كل خمس دقائق تقريبًا وتستمر كل واحدة حوالي دقيقة، لمدة ساعة متواصلة، أو فور نزول ماء الرأس حتى لو لم تبدأ الانقباضات بعد. قد تختلف كل حالة قليلًا حسب توصيات طبيبتك الخاصة، لذا من الأفضل أن تكون لديك خطة واضحة معها مسبقًا حول متى بالضبط تتوجهين.',
    displayOrder: 2,
    relatedKeys: ['b1', 'b3'],
  },
  {
    key: 'b3',
    categoryKey: 'birth',
    questionAr: 'ماذا أضع في حقيبة الولادة؟',
    answerAr:
      'حقيبة الولادة الأساسية تحتاج عادة أوراقك الثبوتية والملف الطبي، ملابس فضفاضة ومريحة لكِ وللمولود، أدوات نظافة شخصية، فوطًا صحية كبيرة، وشاحن هاتفك. يُفضّل تجهيزها من الشهر الثامن لتكوني مستعدة في أي وقت. يمكنك دائمًا سؤال المستشفى الذي ستلدين فيه عن قائمة مفصلة بما يوفرونه وما يجب إحضاره بنفسك.',
    displayOrder: 3,
    relatedKeys: ['b1', 'b2'],
  },
  {
    key: 'b4',
    categoryKey: 'birth',
    questionAr: 'ما الفرق بين الولادة الطبيعية والقيصرية؟',
    answerAr:
      'الولادة الطبيعية تتم عبر المهبل بشكل تلقائي أو بمساعدة بسيطة، بينما الولادة القيصرية عملية جراحية يُخرَج فيها الجنين عبر شق في البطن والرحم. يحدد نوع الولادة المناسب لكِ عادة عدة عوامل صحية تقيّمها طبيبتك المتابعة لحملك، ولكل نوع مساره الخاص في التعافي بعدها. أفضل شخص لمناقشة الخيار الأنسب لحالتك هو طبيبتك.',
    displayOrder: 4,
    relatedKeys: ['b1', 'b6'],
  },
  {
    key: 'b5',
    categoryKey: 'birth',
    questionAr: 'هل الألم أثناء المخاض طبيعي دائمًا؟',
    answerAr:
      'نعم، الألم جزء طبيعي من عملية المخاض نتيجة انقباض الرحم، وتختلف شدته وتجربته من امرأة لأخرى. توجد خيارات متعددة للتخفيف من الألم يمكنك مناقشتها مع طبيبتك مسبقًا. لكن إن شعرتِ بألم حاد ومفاجئ يختلف عن انقباضات المخاض المعتادة، أخبري الطاقم الطبي فورًا لتقييم الحالة.',
    displayOrder: 5,
    relatedKeys: ['b1', 'pp2'],
  },
  {
    key: 'b6',
    categoryKey: 'birth',
    questionAr: 'هل يمكن أن تتأخر الولادة عن الموعد المتوقع؟',
    answerAr:
      'نعم، تاريخ الولادة المتوقع هو تقدير وليس موعدًا دقيقًا، ومن الطبيعي أن تلد بعض النساء قبله أو بعده بأيام. إن تجاوز الحمل الأسبوع الأربعين بعدة أيام، ستتابع طبيبتك حالتك عن قرب أكثر وقد تقترح بعض الفحوصات الإضافية أو تحديد موعد لتحفيز الولادة إذا رأت ذلك مناسبًا لحالتك.',
    displayOrder: 6,
    relatedKeys: ['b1', 'p5'],
  },
  {
    key: 'b7',
    categoryKey: 'birth',
    questionAr: 'من يمكن أن يرافقني أثناء الولادة؟',
    answerAr:
      'يختلف الأمر حسب سياسة كل مستشفى أو عيادة، لكن غالبًا يُسمح بمرافق واحد مثل الزوج أو أحد أفراد العائلة داخل غرفة الولادة. يُفضّل الاستفسار مسبقًا من المستشفى الذي اخترتِه عن سياستهم بالضبط، حتى تكوني وشريككِ مستعدين ومطمئنين ليوم الولادة.',
    displayOrder: 7,
    relatedKeys: ['b3', 'b1'],
  },
  // النفاس
  {
    key: 'pp1',
    categoryKey: 'postpartum',
    questionAr: 'كم تستغرق فترة النفاس؟',
    answerAr:
      'تمتد فترة النفاس عادة حوالي 40 يومًا (ستة أسابيع تقريبًا)، وهي الفترة التي يعود فيها جسمك تدريجيًا إلى حالته قبل الحمل. يختلف التعافي الكامل من امرأة لأخرى حسب نوع الولادة وحالتها الصحية. خلال هذه الفترة، امنحي جسمك الراحة الكافية وتجنّبي المجهود الكبير، وتابعي مع طبيبتك أي تغيّرات تلاحظينها.',
    displayOrder: 1,
    relatedKeys: ['pp2', 'pp4'],
  },
  {
    key: 'pp2',
    categoryKey: 'postpartum',
    questionAr: 'هل النزيف بعد الولادة طبيعي؟',
    answerAr:
      'نعم، نزول دم يشبه الدورة الشهرية بعد الولادة أمر طبيعي تمامًا ويُسمى نزيف النفاس، ويكون في البداية غزيرًا نسبيًا ثم يخف تدريجيًا ويتغير لونه حتى يتوقف خلال أسابيع. من الطبيعي أن يزيد قليلًا مع الحركة أو الرضاعة. إن لاحظتِ نزيفًا غزيرًا جدًا يبلل أكثر من فوطة صحية في الساعة، أو رائحة كريهة، أو تجلطات كبيرة، تواصلي مع طبيبتك بسرعة.',
    displayOrder: 2,
    relatedKeys: ['pp3', 'pp1'],
  },
  {
    key: 'pp3',
    categoryKey: 'postpartum',
    questionAr: 'متى أقلق بخصوص النزيف أو الألم بعد الولادة؟',
    answerAr:
      'من العلامات التي تستدعي التواصل السريع مع طبيبتك: نزيف غزير جدًا أو مفاجئ، ألم شديد لا يخف بالراحة، حمى أو ارتفاع في الحرارة، أو ألم شديد عند التبول. لا داعي للقلق من الانزعاج الخفيف والتعب الطبيعي بعد الولادة، لكن ثقي بحدسك دائمًا، وإن شعرتِ أن شيئًا غير معتاد يحدث، تواصلي مع طبيبتك دون تردد.',
    displayOrder: 3,
    relatedKeys: ['pp2', 'pp6'],
  },
  {
    key: 'pp4',
    categoryKey: 'postpartum',
    questionAr: 'كيف أعتني بنفسي في الأسابيع الأولى بعد الولادة؟',
    answerAr:
      'حاولي الحصول على قسط كافٍ من الراحة والنوم كلما أمكن، حتى لو بفترات قصيرة متفرقة مع المولود. اهتمي بتغذية جيدة وشرب كمية كافية من الماء خاصة إن كنتِ ترضعين. لا تترددي في طلب المساعدة من العائلة في المهام المنزلية. امنحي نفسك الوقت الكافي للتعافي جسديًا ونفسيًا دون ضغط لإنجاز كل شيء بسرعة.',
    displayOrder: 4,
    relatedKeys: ['pp5', 'pp6'],
  },
  {
    key: 'pp5',
    categoryKey: 'postpartum',
    questionAr: 'متى يمكنني استئناف النشاط البدني بعد الولادة؟',
    answerAr:
      'بشكل عام يُنصح بالانتظار حتى تتأكد طبيبتك من تعافيك في زيارة المتابعة بعد الولادة، والتي تكون عادة بعد أسابيع قليلة، قبل استئناف التمارين الرياضية المعتادة. يمكن البدء بمشي خفيف مبكرًا إن شعرتِ بالراحة لذلك. المهم هو الاستماع لجسمك والتدرج، وعدم التسرع، خاصة إن كانت الولادة قيصرية.',
    displayOrder: 5,
    relatedKeys: ['pp1', 'pp4'],
  },
  {
    key: 'pp6',
    categoryKey: 'postpartum',
    questionAr: 'هل تقلب المزاج بعد الولادة طبيعي؟',
    answerAr:
      'نعم، من الطبيعي جدًا أن تمري بتقلبات مزاجية بعد الولادة بسبب التغيرات الهرمونية والتعب وقلة النوم، وهذا ما يُعرف أحيانًا بكآبة النفاس الخفيفة وتزول عادة خلال أسبوعين. لكن إن استمر الحزن أو القلق أو شعرتِ أنه يؤثر بشدة على حياتك اليومية لأكثر من أسبوعين، من المهم جدًا التحدث مع طبيبتك أو أخصائية نفسية، فالدعم المبكر يساعد كثيرًا.',
    displayOrder: 6,
    relatedKeys: ['pp3', 'pp7'],
  },
  {
    key: 'pp7',
    categoryKey: 'postpartum',
    questionAr: 'متى أراجع الطبيبة بعد الولادة؟',
    answerAr:
      'عادة تُحدد زيارة متابعة بعد الولادة خلال الأسابيع الأربعة إلى الستة الأولى للاطمئنان على تعافيك الجسدي والنفسي. لكن لا تنتظري هذا الموعد إن شعرتِ بأي أعراض مقلقة قبله مثل نزيف غزير أو حمى أو ألم شديد، فيمكنك بل ويجب عليك التواصل مع طبيبتك في أي وقت تشعرين فيه بالحاجة لذلك.',
    displayOrder: 7,
    relatedKeys: ['pp2', 'pp3'],
  },
  // الرضاعة
  {
    key: 'rf1',
    categoryKey: 'breastfeeding',
    questionAr: 'متى أبدأ الرضاعة الطبيعية بعد الولادة؟',
    answerAr:
      'يُنصح غالبًا بالبدء بالرضاعة الطبيعية في الساعة الأولى بعد الولادة إن كانت حالتك وحالة المولود تسمحان بذلك، لأن هذا التلامس المبكر يساعد على تحفيز إنتاج الحليب وتهدئة الطفل. إن لم يكن ذلك ممكنًا مباشرة لأي سبب، لا داعي للقلق، فيمكن البدء لاحقًا بمساعدة الطاقم الطبي أو مستشارة الرضاعة في المستشفى.',
    displayOrder: 1,
    relatedKeys: ['rf2', 'rf5'],
  },
  {
    key: 'rf2',
    categoryKey: 'breastfeeding',
    questionAr: 'كيف أعرف أن طفلي يشبع من الرضاعة؟',
    answerAr:
      'من العلامات المطمئنة أن طفلك يحصل على كفايته: بلل عدد كافٍ من الحفاضات يوميًا، زيادة منتظمة في وزنه حسب متابعة الطبيبة، وهدوئه ونومه بارتياح بعد الرضعة. سماع صوت بلع أثناء الرضاعة علامة جيدة أيضًا. إن كنتِ قلقة بخصوص وزن طفلك أو شبعه، تابعي ذلك مع طبيبة الأطفال في الزيارات الدورية.',
    displayOrder: 2,
    relatedKeys: ['rf5', 'rf6'],
  },
  {
    key: 'rf3',
    categoryKey: 'breastfeeding',
    questionAr: 'ماذا أفعل إذا شعرت بألم أثناء الرضاعة؟',
    answerAr:
      'بعض الحساسية الخفيفة في الأيام الأولى من الرضاعة أمر شائع، لكن الألم الشديد المستمر غالبًا ما يكون علامة على وضعية غير صحيحة للطفل أثناء الرضاعة. تأكدي أن فم الطفل يلتقم الحلمة والهالة المحيطة بها معًا لا الحلمة وحدها. إن استمر الألم أو ظهر تشقق أو احمرار شديد، من المفيد استشارة مستشارة رضاعة أو طبيبتك لمساعدتك على تصحيح الوضعية.',
    displayOrder: 3,
    relatedKeys: ['rf1', 'rf2'],
  },
  {
    key: 'rf4',
    categoryKey: 'breastfeeding',
    questionAr: 'هل يمكنني شفط الحليب وتخزينه؟',
    answerAr:
      'نعم، شفط الحليب وتخزينه خيار شائع ومفيد خاصة إن احتجتِ للابتعاد عن طفلك لفترة أو أردتِ تكوين مخزون احتياطي. يمكن حفظ الحليب المشفوط في الثلاجة لبضعة أيام أو في الفريزر لفترة أطول باستخدام أوعية معقّمة مخصصة لذلك. من المفيد سؤال مستشارة الرضاعة عن أفضل الطرق والمدد الزمنية المناسبة لحفظ الحليب بأمان.',
    displayOrder: 4,
    relatedKeys: ['rf5', 'rf7'],
  },
  {
    key: 'rf5',
    categoryKey: 'breastfeeding',
    questionAr: 'كم مرة يجب أن أرضع طفلي يوميًا؟',
    answerAr:
      'يحتاج المولود عادة إلى الرضاعة بشكل متكرر، قد يصل إلى 8-12 مرة خلال 24 ساعة في الأسابيع الأولى، لأن معدته صغيرة جدًا وتحتاج تغذية متكررة. الأفضل إرضاعه عند الطلب حين يُظهر علامات الجوع، لا بجدول زمني صارم، خاصة في البداية. مع نمو طفلك، ستلاحظين أن عدد الرضعات يتنظم أكثر تدريجيًا.',
    displayOrder: 5,
    relatedKeys: ['rf2', 'rf6'],
  },
  {
    key: 'rf6',
    categoryKey: 'breastfeeding',
    questionAr: 'ماذا لو كانت كمية الحليب قليلة؟',
    answerAr:
      'القلق بشأن كمية الحليب شائع جدًا بين الأمهات الجدد، والرضاعة المتكررة هي أفضل طريقة لتحفيز الجسم على إنتاج المزيد من الحليب لأن الطلب يحفّز العرض. الراحة الكافية وشرب السوائل والتغذية الجيدة تساعد أيضًا. إن استمر قلقك أو لاحظتِ علامات على أن طفلك لا يشبع فعليًا، تحدثي مع طبيبة الأطفال أو مستشارة رضاعة لتقييم الأمر عن قرب.',
    displayOrder: 6,
    relatedKeys: ['rf5', 'rf2'],
  },
  {
    key: 'rf7',
    categoryKey: 'breastfeeding',
    questionAr: 'هل يمكن الجمع بين الرضاعة الطبيعية والصناعية؟',
    answerAr:
      'نعم، بعض الأمهات يخترن الجمع بين الرضاعة الطبيعية والحليب الصناعي لأسباب مختلفة، وهذا خيار شخصي مقبول تمامًا. الأفضل استشارة طبيبة الأطفال حول التوقيت والطريقة المناسبة لإدخال الحليب الصناعي دون التأثير سلبًا على إنتاج حليبك الطبيعي إن كنتِ ترغبين بالاستمرار في الرضاعة الطبيعية أيضًا.',
    displayOrder: 7,
    relatedKeys: ['rf4', 'rf5'],
  },
  // الطفل
  {
    key: 'c1',
    categoryKey: 'baby',
    questionAr: 'كم ساعة ينام المولود يوميًا؟',
    answerAr:
      'ينام معظم المواليد الجدد بين 14 و17 ساعة يوميًا، لكن في فترات متقطعة قصيرة على مدار اليوم والليل وليس بشكل متواصل، لأن معدتهم الصغيرة تحتاج رضعات متكررة. هذا أمر طبيعي تمامًا حتى لو كان متعبًا لكِ، وستلاحظين تدريجيًا أن فترات نومه تطول أكثر مع نموه في الأشهر القادمة.',
    displayOrder: 1,
    relatedKeys: ['c2', 'pp4'],
  },
  {
    key: 'c2',
    categoryKey: 'baby',
    questionAr: 'لماذا يبكي طفلي كثيرًا؟',
    answerAr:
      'البكاء هو الطريقة الوحيدة التي يتواصل بها المولود، وقد يعني الجوع، الحاجة لتغيير الحفاض، التعب، الرغبة في الاحتضان، أو مجرد الانزعاج من البرد أو الحر. مع الوقت ستتعرفين أكثر على أنماط بكاء طفلك ومعانيها المختلفة. إن بدا البكاء غير معتاد أو حادًا بشكل مختلف، أو مصحوبًا بحمى أو رفض الرضاعة تمامًا، من الأفضل استشارة طبيبة الأطفال.',
    displayOrder: 2,
    relatedKeys: ['c1', 'c5'],
  },
  {
    key: 'c3',
    categoryKey: 'baby',
    questionAr: 'ما جدول اللقاحات الأساسي؟',
    answerAr:
      'يتبع جدول تطعيمات الأطفال في الجزائر برنامجًا وطنيًا محددًا يبدأ من الولادة ويستمر خلال السنوات الأولى، ويشمل لقاحات ضد أمراض مثل السل والكبد الفيروسي والشلل والحصبة وغيرها. الطبيبة المتابعة لطفلك هي المرجع الأدق لجدول التطعيمات المحدث ومواعيده بالتفصيل حسب عمر طفلك، فاحرصي على الالتزام بمواعيد زياراتها.',
    displayOrder: 3,
    relatedKeys: ['c4', 'c5'],
  },
  {
    key: 'c4',
    categoryKey: 'baby',
    questionAr: 'ما علامات النمو الطبيعي في الأشهر الأولى؟',
    answerAr:
      'من العلامات المطمئنة في الأشهر الأولى: زيادة منتظمة في الوزن والطول حسب متابعة طبيبة الأطفال، تحسّن التحكم في حركة الرأس تدريجيًا، والاستجابة للأصوات والوجوه المألوفة بالابتسام أو التحديق. كل طفل ينمو بوتيرته الخاصة قليلًا، لكن المتابعة الدورية مع طبيبة الأطفال هي أفضل وسيلة لتتبع نمو طفلك بدقة والاطمئنان عليه.',
    displayOrder: 4,
    relatedKeys: ['c3', 'c1'],
  },
  {
    key: 'c5',
    categoryKey: 'baby',
    questionAr: 'متى أقلق بشأن حرارة طفلي؟',
    answerAr:
      'ارتفاع حرارة الرضيع، خاصة في الأشهر الأولى، يستحق انتباهًا سريعًا أكثر من الأطفال الأكبر سنًا. إن لاحظتِ أن حرارة طفلك مرتفعة عن المعتاد، أو بدا خاملًا بشكل غير طبيعي أو رافضًا للرضاعة تمامًا، تواصلي مع طبيبة الأطفال أو توجهي للطوارئ دون تأخير، خاصة إن كان عمر طفلك أقل من ثلاثة أشهر.',
    displayOrder: 5,
    relatedKeys: ['c2', 'c4'],
  },
  {
    key: 'c6',
    categoryKey: 'baby',
    questionAr: 'كيف أعتني بالحبل السري؟',
    answerAr:
      'حافظي على جفاف منطقة الحبل السري ونظافتها، وتجنبي تغطيتها بإحكام بالحفاض حتى تسقط بقيته تلقائيًا خلال الأسبوعين الأولين غالبًا. لا داعي لاستخدام أي مواد عليها إلا إن نصحت طبيبة الأطفال بذلك. إن لاحظتِ احمرارًا أو تورمًا أو رائحة كريهة أو إفرازات من المنطقة، أخبري طبيبة الأطفال لتقييم الأمر.',
    displayOrder: 6,
    relatedKeys: ['c5', 'c3'],
  },
  {
    key: 'c7',
    categoryKey: 'baby',
    questionAr: 'متى تظهر أسنان الطفل الأولى؟',
    answerAr:
      'تبدأ أغلب الأطفال بالتسنين بين الشهر السادس والشهر العاشر تقريبًا، لكن هذا يختلف كثيرًا من طفل لآخر وقد يبدأ مبكرًا أو متأخرًا قليلًا دون أن يكون ذلك مقلقًا. قد يرافق التسنين بعض الانزعاج وزيادة اللعاب ورغبة في العض. إن ظهرت أعراض مثل حمى مرتفعة أو إسهال شديد مصاحبة، فهذه غالبًا ليست من التسنين نفسه، فمن الأفضل استشارة طبيبة الأطفال.',
    displayOrder: 7,
    relatedKeys: ['c5', 'c2'],
  },
];

// مقالات المدوّنة التجريبية — تنبيه: هذا محتوى تجريبي لأغراض التطوير والاختبار فقط،
// ويحتاج مراجعة فعلية من أخصائية طبية معتمدة (نساء وتوليد/تغذية/نفسية بحسب الفئة) قبل
// اعتماده للنشر الحقيقي أمام المستخدمات، رغم بذل العناية بدقته العلمية العامة أثناء الكتابة
const ARTICLES_SEED: {
  titleAr: string;
  slug: string;
  excerptAr: string;
  contentAr: string;
  coverImageUrl: string;
  category: ArticleCategory;
  authorName: string;
}[] = [
  {
    titleAr: 'الغثيان الصباحي في الحمل: الأسباب وطرق التخفيف',
    slug: 'nausea-during-pregnancy',
    excerptAr:
      'يُعدّ الغثيان الصباحي من أكثر أعراض الحمل شيوعًا، خاصة في الأشهر الثلاثة الأولى. تعرّفي على أسبابه وأبرز الطرق الآمنة للتخفيف منه في حياتك اليومية.',
    contentAr: `يُعدّ الغثيان الصباحي أحد أكثر الأعراض المصاحبة للحمل شيوعًا، إذ تعاني منه غالبية الحوامل بدرجات متفاوتة خلال الأشهر الثلاثة الأولى. ورغم تسميته بـ"الصباحي"، فإنه قد يظهر في أي وقت من اليوم، وقد يستمر لدى بعض الأمهات حتى الأسبوع السادس عشر أو أكثر.

يُعتقد أن السبب الرئيسي وراء هذا العرض هو الارتفاع السريع في هرمون الحمل (hCG) وهرمون الإستروجين خلال الأسابيع الأولى، إضافة إلى زيادة حساسية حاسة الشم لدى الحامل، ما يجعلها أكثر تأثرًا بروائح معينة كانت تتقبلها سابقًا دون مشكلة.

من أبرز الطرق التي قد تساعد على التخفيف من الغثيان:

تناول وجبات صغيرة ومتكررة بدل ثلاث وجبات كبيرة، لتجنّب فراغ المعدة الذي يزيد الشعور بالغثيان.
الإكثار من شرب الماء على مدار اليوم بكميات صغيرة بدل الشرب الغزير دفعة واحدة.
تجنّب الروائح القوية أو الأطعمة الدسمة والحارة التي قد تحفّز الشعور بالغثيان.
تناول قطعة من البسكويت الجاف أو الخبز المحمّص فور الاستيقاظ قبل النهوض من الفراش.
الحصول على قسط كافٍ من الراحة، فالإرهاق يزيد من حدة الأعراض لدى كثير من الحوامل.

في أغلب الحالات، يُعدّ الغثيان الصباحي عرضًا طبيعيًا لا يستدعي القلق، ويخف تدريجيًا مع تقدّم الحمل. لكن إذا كان الغثيان شديدًا ومصحوبًا بقيء متكرر يمنعكِ من الاحتفاظ بالطعام أو السوائل، أو إذا لاحظتِ فقدان وزن ملحوظ أو علامات جفاف، فهذه إشارة لضرورة استشارة الطبيب فورًا، إذ قد يكون الأمر متعلقًا بحالة تُعرف بـ"القيء المفرط للحوامل" التي تحتاج متابعة طبية ومتخصصة.

تذكّري أن كل حمل مختلف عن الآخر، وأن شدة الغثيان لا ترتبط بالضرورة بصحة الجنين. امنحي جسدك الوقت والراحة التي يحتاجها، ولا تترددي في طلب الدعم من محيطك خلال هذه المرحلة.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80',
    category: ArticleCategory.pregnancy,
    authorName: 'د. أمينة بلحاج',
  },
  {
    titleAr: 'التغذية السليمة خلال الثلث الأول من الحمل',
    slug: 'nutrition-first-trimester',
    excerptAr:
      'الأسابيع الأولى من الحمل مرحلة حسّاسة في تكوين أعضاء الجنين. تعرّفي على أهم العناصر الغذائية التي تحتاجينها خلال هذه الفترة وكيفية التعامل مع فقدان الشهية.',
    contentAr: `يشهد الثلث الأول من الحمل، الممتد من الأسبوع الأول حتى الأسبوع الثاني عشر تقريبًا، بداية تكوّن الأعضاء الأساسية للجنين، ما يجعل التغذية خلال هذه الفترة عاملًا مهمًا وإن لم تكن الاحتياجات السعرية قد ارتفعت بعد بشكل كبير مقارنة بمراحل الحمل اللاحقة.

من أهم العناصر الغذائية التي تحتاجها الحامل في هذه المرحلة:

حمض الفوليك: يُنصح بالاستمرار في تناوله لدوره الأساسي في الوقاية من تشوهات الأنبوب العصبي لدى الجنين، ويوجد في الخضروات الورقية الداكنة والبقوليات، إضافة إلى المكملات التي يصفها الطبيب.
الحديد: تزداد الحاجة إليه تدريجيًا لدعم زيادة حجم الدم، ويتوفر في اللحوم الحمراء والعدس والسبانخ.
الكالسيوم وفيتامين د: ضروريان لبناء عظام الجنين، ويمكن الحصول عليهما من منتجات الألبان والتعرض المعتدل لأشعة الشمس.
البروتين: أساسي لنمو أنسجة الجنين والمشيمة، وتوفره اللحوم والبيض والبقوليات ومنتجات الألبان.

من التحديات الشائعة في هذه المرحلة فقدان الشهية أو صعوبة تقبّل بعض الأطعمة بسبب الغثيان. في هذه الحالة، لا داعي للقلق من عدم إكمال "حصص" غذائية محددة يوميًا، بل ركّزي على تناول ما تتقبّله معدتك من أطعمة صحية متنوعة قدر الإمكان، وقسّمي وجباتك على فترات متقاربة بدل الالتزام بمواعيد ثابتة.

يُفضَّل أيضًا تجنّب الأطعمة النيئة أو غير المطهوة جيدًا، والأسماك عالية الزئبق، والكميات الكبيرة من الكافيين، حفاظًا على سلامة الحمل.

تذكّري أن أفضل نظام غذائي هو ما يناسب جسدك واحتياجاتك الخاصة، ولا بديل عن استشارة أخصائية التغذية أو الطبيب المتابع لحملك لوضع خطة غذائية مناسبة لحالتك الصحية.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&q=80',
    category: ArticleCategory.pregnancy,
    authorName: 'أ. سارة مرزوقي، أخصائية تغذية',
  },
  {
    titleAr: 'علامات المخاض الحقيقي: كيف تفرّقين بينها وبين الانقباضات التمهيدية؟',
    slug: 'signs-of-true-labor',
    excerptAr:
      'مع اقتراب موعد الولادة، قد يصعب التمييز بين انقباضات براكستون هيكس التمهيدية والمخاض الحقيقي. إليك أبرز العلامات التي تساعدك على معرفة الفرق.',
    contentAr: `مع اقتراب نهاية الحمل، تبدأ كثير من الأمهات بالشعور بانقباضات متفرقة، فيصعب أحيانًا التمييز بين ما يُعرف بـ"انقباضات براكستون هيكس" التمهيدية وبين انقباضات المخاض الحقيقي التي تسبق الولادة الفعلية.

انقباضات براكستون هيكس عادة ما تكون غير منتظمة في توقيتها وشدتها، ولا تزداد قوة مع الوقت، وغالبًا ما تخف أو تختفي عند تغيير الوضعية أو المشي أو الراحة. أما انقباضات المخاض الحقيقي فتتميز بعدة علامات واضحة:

الانتظام: تأتي على فترات متقاربة تدريجيًا، وتصبح أكثر تكرارًا مع مرور الوقت.
الشدة المتزايدة: تزداد قوة الانقباض تدريجيًا ولا تخف بالراحة أو تغيير الوضعية.
الألم المنتشر: غالبًا ما يبدأ الألم في أسفل الظهر وينتقل إلى مقدمة البطن، خلافًا لانقباضات براكستون التي تتركز غالبًا في مقدمة البطن فقط.
تغيّرات عنق الرحم: يبدأ عنق الرحم بالتمدد والانفتاح تدريجيًا، وهو ما يُحدَّد طبيًا عند الفحص.

من العلامات الأخرى التي قد تصاحب بداية المخاض الحقيقي: نزول السدادة المخاطية، أو نزول ماء الرأس (تمزق الأغشية)، وهو أمر يستدعي التوجه للمستشفى فورًا حتى لو لم تبدأ الانقباضات المنتظمة بعد.

القاعدة العملية الشائعة التي يُنصح بها كثير من مقدمي الرعاية الصحية هي "قاعدة 5-1-1": عندما تصبح الانقباضات متباعدة كل خمس دقائق، وتستمر كل واحدة منها لمدة دقيقة كاملة، ولمدة ساعة متواصلة على الأقل، فهذا مؤشر قوي على أن المخاض قد بدأ فعليًا، ويستوجب التواصل مع طبيبتك أو التوجه إلى المستشفى.

في جميع الأحوال، إذا شعرتِ بالقلق أو عدم اليقين تجاه ما تشعرين به، لا تترددي في التواصل مع فريقك الطبي؛ فهم الأقدر على تقييم حالتك بدقة، ولا داعي لتحمّل القلق وحدك.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=800&q=80',
    category: ArticleCategory.birth,
    authorName: 'د. ليندة حمداوي، قابلة',
  },
  {
    titleAr: 'الولادة القيصرية: متى تكون ضرورية وكيف تستعدّين لها؟',
    slug: 'cesarean-section-guide',
    excerptAr:
      'قد تكون الولادة القيصرية خيارًا مخططًا له مسبقًا أو قرارًا طارئًا أثناء المخاض. تعرّفي على أبرز أسبابها وكيفية الاستعداد لها جسديًا ونفسيًا.',
    contentAr: `الولادة القيصرية عملية جراحية يُستخرج فيها الجنين عبر شق في جدار البطن والرحم، وتُجرى إما بشكل مخطط له مسبقًا لأسباب طبية واضحة، أو كقرار طارئ أثناء المخاض إذا استجدّت مضاعفات تستدعي التدخل السريع.

من أبرز الأسباب التي قد تستدعي ولادة قيصرية مخططة: وضعية الجنين غير الطبيعية (كالمجيء المقعدي)، أو المشيمة المنزاحة التي تغطي عنق الرحم، أو وجود حمل بتوائم متعددة في بعض الحالات، أو تاريخ سابق لولادة قيصرية بحسب نوع الشق المستخدم سابقًا. أما الأسباب الطارئة فتشمل توقف تقدّم المخاض رغم مرور وقت طويل، أو معاناة الجنين وتغيّر معدل ضربات قلبه بشكل يستدعي التدخل الفوري.

للاستعداد لولادة قيصرية مخططة، من المفيد:

التحدث مع طبيبتك مسبقًا حول تفاصيل العملية ونوع التخدير المناسب لحالتك.
تجهيز حقيبة المستشفى مبكرًا، مع مراعاة أن فترة التعافي بعد القيصرية أطول نسبيًا من الولادة الطبيعية.
ترتيب من يساعدك في المنزل خلال الأسابيع الأولى بعد الولادة، لأن الحركة قد تكون محدودة في البداية.
التحضير النفسي والتقبّل بأن الولادة القيصرية ليست "أقل" من الولادة الطبيعية، بل خيار طبي آمن يهدف لسلامتك وسلامة طفلك.

بعد العملية، ستحتاجين لبضعة أيام في المستشفى للمتابعة، ثم فترة نقاهة في المنزل قد تمتد لأسابيع، مع تجنّب حمل الأشياء الثقيلة أو المجهود البدني الكبير خلال هذه الفترة. احرصي على متابعة الجرح والالتزام بتعليمات طبيبتك لتفادي أي مضاعفات.

مهما كان نوع ولادتك، تذكّري أن الهدف الأسمى هو وصولكِ وطفلك بسلام، وأن قرارات فريقك الطبي تُبنى غالبًا على تقييم دقيق لما هو الأنسب لحالتك الخاصة.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80',
    category: ArticleCategory.birth,
    authorName: 'د. أمينة بلحاج',
  },
  {
    titleAr: 'التعافي الجسدي بعد الولادة: ماذا تتوقعين في الأسابيع الأولى؟',
    slug: 'physical-recovery-after-birth',
    excerptAr:
      'جسدك يمرّ بتغيّرات كبيرة بعد الولادة يحتاج فيها للوقت والرعاية. إليك أبرز ما يمكن توقعه خلال فترة النفاس وكيفية الاعتناء بنفسك.',
    contentAr: `تمر الأم بمرحلة تعافٍ جسدي مهمة بعد الولادة، تُعرف بفترة النفاس، وتمتد عادة لنحو ستة إلى ثمانية أسابيع، وإن كان التعافي الكامل قد يستغرق وقتًا أطول من ذلك بحسب طبيعة كل جسد ونوع الولادة.

من أبرز التغيّرات المتوقعة خلال هذه الفترة:

النزيف المهبلي (النفاس): يستمر عادة لأسابيع، ويتناقص تدريجيًا في الكمية واللون حتى يتوقف. أي نزيف غزير مفاجئ أو رائحة غير معتادة يستدعي التواصل مع الطبيبة فورًا.
تقلّصات الرحم: مع عودة الرحم تدريجيًا لحجمه الطبيعي، قد تشعرين بتقلّصات خفيفة، خاصة أثناء الرضاعة.
ألم منطقة الخياطة أو الشق: سواء كان بسبب تمزق طبيعي أثناء الولادة أو شق القيصرية، يحتاج الجرح وقتًا وعناية للالتئام.
تغيّرات الثدي: مع بدء إدرار الحليب، قد تشعرين باحتقان أو حساسية في الثديين خلال الأيام الأولى.
التعرّق الليلي: شائع في الأسابيع الأولى بسبب تغيّر مستويات الهرمونات، وهو أمر طبيعي غالبًا.

للعناية بنفسك خلال هذه الفترة:

امنحي جسدك راحة كافية قدر الإمكان، ونامي عندما ينام طفلك.
حافظي على نظافة منطقة الجرح أو الخياطة وفق تعليمات الطبيبة.
اشربي كميات كافية من الماء، خاصة إن كنتِ ترضعين طبيعيًا.
لا تترددي في طلب المساعدة من محيطك في الأعمال المنزلية ورعاية الطفل.
تجنّبي حمل الأشياء الثقيلة أو المجهود البدني الشاق حتى تستأذني طبيبتك بذلك.

تذكّري أن التعافي ليس سباقًا، وأن كل جسد يحتاج وقته الخاص. كوني لطيفة مع نفسك، ولا تقارني رحلتك بتجارب غيرك.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&q=80',
    category: ArticleCategory.postpartum,
    authorName: 'د. ليندة حمداوي، قابلة',
  },
  {
    titleAr: 'اكتئاب ما بعد الولادة: كيف تميّزينه عن كآبة النفاس العابرة؟',
    slug: 'postpartum-depression-vs-baby-blues',
    excerptAr:
      'من الطبيعي أن تمرّي بتقلبات مزاجية بعد الولادة، لكن كيف تعرفين متى تتجاوز هذه المشاعر الحدّ الطبيعي وتحتاج دعمًا متخصصًا؟',
    contentAr: `من الشائع جدًا أن تمرّ الأم بتقلبات مزاجية في الأيام الأولى بعد الولادة، فيما يُعرف بـ"كآبة النفاس" أو baby blues، والتي تصيب نسبة كبيرة من الأمهات وتتمثل في شعور بالحزن أو البكاء دون سبب واضح، وتقلّب المزاج، والشعور بالإرهاق والقلق الزائد. هذه الحالة عادة ما تبدأ خلال الأيام الأولى بعد الولادة وتزول من تلقاء نفسها خلال أسبوعين تقريبًا دون الحاجة لعلاج.

لكن إذا استمرت هذه المشاعر لأكثر من أسبوعين، أو ازدادت حدّتها بدل أن تخف، فقد يكون الأمر متعلقًا بحالة تُعرف باكتئاب ما بعد الولادة، وهي حالة طبية حقيقية تستدعي الدعم والمتابعة المتخصصة، وليست علامة ضعف أو تقصير من الأم بأي شكل.

من العلامات التي قد تشير إلى اكتئاب ما بعد الولادة:

شعور مستمر بالحزن العميق أو الفراغ لمعظم أيام الأسبوع.
فقدان الاهتمام بالأنشطة التي كانت تُسعدك سابقًا.
صعوبة شديدة في التواصل العاطفي مع الطفل أو الشعور بالذنب حيال ذلك.
اضطرابات واضحة في النوم أو الشهية لا ترتبط فقط بمتطلبات رعاية المولود.
أفكار مقلقة تجاه نفسك أو طفلك، وهي علامة تستدعي طلب المساعدة فورًا دون تأخير.

من المهم جدًا أن تعلمي أن اكتئاب ما بعد الولادة حالة قابلة للعلاج، وأن طلب المساعدة خطوة شجاعة لا ضعف فيها. تحدّثي بصراحة مع طبيبتك أو أخصائية نفسية متخصصة إن شعرتِ بأي من هذه الأعراض، فالدعم المبكر يصنع فرقًا كبيرًا في مسار تعافيك وفي علاقتك بطفلك.

لا تترددي أيضًا في مشاركة ما تشعرين به مع شريك حياتك أو من تثقين بهم من محيطك، فمشاركة الشعور خطوة أولى مهمة نحو التعافي.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&q=80',
    category: ArticleCategory.postpartum,
    authorName: 'أ. هدى بوزيد، أخصائية نفسية',
  },
  {
    titleAr: 'الرضاعة الطبيعية في الأسابيع الأولى: نصائح عملية لبداية موفقة',
    slug: 'breastfeeding-first-weeks',
    excerptAr:
      'قد تكون الأسابيع الأولى من الرضاعة الطبيعية تحديًا لكثير من الأمهات الجدد. إليك أبرز النصائح العملية لتسهيل هذه المرحلة على الأم والطفل.',
    contentAr: `تُعدّ الأسابيع الأولى من الرضاعة الطبيعية مرحلة تأقلم لكل من الأم وطفلها، وقد تواجه فيها بعض الأمهات صعوبات مؤقتة قبل أن تستقر عملية الرضاعة تدريجيًا.

من أهم النصائح العملية لبداية موفقة:

البدء المبكر: يُنصح ببدء الرضاعة خلال الساعة الأولى بعد الولادة إن أمكن، لأنها تساعد على تحفيز إدرار الحليب وتقوية الترابط بين الأم وطفلها.
التثبيت الصحيح: تأكدي من أن فم الطفل يحيط بالحلمة والهالة المحيطة بها بشكل كامل، لا الحلمة فقط، فهذا يقلل من الألم ويحسّن كفاءة الرضاعة.
الرضاعة عند الطلب: في الأسابيع الأولى، يحتاج الطفل للرضاعة كل ساعتين إلى ثلاث ساعات تقريبًا، بما في ذلك أثناء الليل، وهذا أمر طبيعي يساعد على بناء كمية الحليب المناسبة لاحتياجاته.
الاهتمام بتغذيتك وراحتك: جسدك يحتاج طاقة إضافية لإنتاج الحليب، فاحرصي على تناول وجبات متوازنة وشرب كميات كافية من الماء.

من الطبيعي أن تشعري ببعض الحساسية أو الألم الخفيف في الحلمتين خلال الأيام الأولى، لكن الألم الشديد المستمر أو وجود تشقّقات قد يشير إلى مشكلة في وضعية الرضاعة، ويُفضَّل عندها طلب المساعدة من مختصة رضاعة أو القابلة المتابعة لحالتك.

راقبي أيضًا علامات حصول طفلك على كفايته من الحليب، مثل عدد مرات تبليل الحفاض، واستقرار وزنه أو زيادته تدريجيًا بحسب متابعة طبيب الأطفال.

تذكّري أن الرضاعة الطبيعية مهارة تحتاج وقتًا لكِ ولطفلك لإتقانها معًا، وأن طلب المساعدة من المختصات في هذه المرحلة أمر طبيعي جدًا ولا يعني الفشل بأي شكل من الأشكال.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    category: ArticleCategory.baby_health,
    authorName: 'أ. نادية شريفي، مختصة رضاعة',
  },
  {
    titleAr: 'جدول التطعيمات الأساسية في السنة الأولى: ما تحتاجين معرفته',
    slug: 'baby-vaccination-schedule-first-year',
    excerptAr:
      'التطعيمات خط الدفاع الأول لحماية طفلك من أمراض خطيرة. تعرّفي على الجدول العام للتطعيمات في السنة الأولى وأهمية الالتزام بمواعيدها.',
    contentAr: `تُعدّ التطعيمات من أهم وسائل الوقاية التي تحمي طفلك من أمراض خطيرة يمكن أن تسبب مضاعفات صحية شديدة لو أُصيب بها في عمر مبكر. ويوصي الأطباء بجدول تطعيمات منظّم خلال السنة الأولى من عمر الطفل، يبدأ من لحظة الولادة ويستمر على مراحل محددة.

بشكل عام، يشمل الجدول الأساسي للتطعيمات في السنة الأولى:

عند الولادة: تطعيم التهاب الكبد الوبائي B، وتطعيم السل (BCG) بحسب البرنامج الوطني للتطعيمات.
الشهر الثاني والرابع والسادس: جرعات متتالية من التطعيم الخماسي أو السداسي الذي يغطي الدفتيريا والكزاز والسعال الديكي وشلل الأطفال والمستدمية النزلية، إضافة إلى تطعيم الالتهاب الرئوي والروتا فيروس بحسب البرنامج المتّبع.
الشهر التاسع أو الثاني عشر: تطعيم الحصبة والحصبة الألمانية والنكاف (MMR)، وتطعيمات أخرى بحسب توصيات الجدول الوطني.

من المهم الالتزام بمواعيد التطعيمات المحددة قدر الإمكان، لأن كل جرعة مصممة لبناء مناعة تراكمية تحمي الطفل بشكل كامل، وتأخير الجرعات دون داعٍ طبي قد يترك الطفل عرضة للإصابة خلال فترة حرجة من نموه.

من الطبيعي أن يعاني بعض الأطفال من ارتفاع طفيف في الحرارة أو تورّم بسيط في مكان الحقن بعد التطعيم، وهي أعراض جانبية شائعة تزول خلال يوم أو يومين. يمكن استشارة طبيب الأطفال حول طرق آمنة للتخفيف من هذه الأعراض عند الحاجة.

احتفظي بسجل تطعيمات طفلك محدّثًا دائمًا، وتأكدي من موعد كل جرعة قادمة بالتنسيق مع طبيب الأطفال المتابع، فهو الأقدر على تعديل الجدول بحسب الحالة الصحية الخاصة لطفلك إن استدعى الأمر ذلك.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=800&q=80',
    category: ArticleCategory.baby_health,
    authorName: 'د. أمينة بلحاج',
  },
];

function estimateReadTimeMinutes(contentAr: string): number {
  const wordCount = contentAr.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 250));
}

// ثلاثة حسابات admin بصلاحيات متطابقة تمامًا (نفس دور UserRole.admin) — الاسم يُخزَّن في
// AdminProfile وليس User لأن الأخير لا يملك حقل اسم أصلًا (نفس سبب Testimonial.displayName)
const ADMINS_SEED: { phone: string; fullName: string; email: string }[] = [
  { phone: '0500000000', fullName: 'آية فاضل', email: 'aya.fadel@maternacare.dz' },
  { phone: '0500000010', fullName: 'فلة بن الشارف', email: 'fella.bencharef@maternacare.dz' },
  { phone: '0500000011', fullName: 'سعاد بن جديدي', email: 'souad.bendjedidi@maternacare.dz' },
];

async function main() {
  console.log('بدء عملية زرع البيانات (seed)...');

  for (const week of WEEK_CONTENT_SEED) {
    await prisma.pregnancyWeekContent.upsert({
      where: { weekNumber: week.weekNumber },
      update: week,
      create: week,
    });
  }
  console.log(`تم زرع محتوى ${WEEK_CONTENT_SEED.length} أسابيع في pregnancy_week_content`);

  for (const domainSeed of ASSESSMENT_DOMAINS_SEED) {
    const domain = await prisma.assessmentDomain.upsert({
      where: { name: domainSeed.name },
      update: { nameAr: domainSeed.nameAr, isLegacy: true },
      create: { name: domainSeed.name, nameAr: domainSeed.nameAr, isLegacy: true },
    });

    for (const [index, questionTextAr] of domainSeed.questions.entries()) {
      const existing = await prisma.assessmentQuestion.findFirst({
        where: { domainId: domain.id, order: index + 1 },
      });
      if (existing) {
        await prisma.assessmentQuestion.update({
          where: { id: existing.id },
          data: { questionTextAr },
        });
      } else {
        await prisma.assessmentQuestion.create({
          data: { domainId: domain.id, questionTextAr, order: index + 1 },
        });
      }
    }
  }
  console.log(`تم زرع ${ASSESSMENT_DOMAINS_SEED.length} محاور تقييم نفسي قديمة (legacy) بأسئلتها`);

  for (const scaleSeed of [GAD7_SEED, EPDS_SEED]) {
    const domain = await prisma.assessmentDomain.upsert({
      where: { name: scaleSeed.name },
      update: {
        nameAr: scaleSeed.nameAr,
        descriptionAr: scaleSeed.descriptionAr,
        instructionsAr: scaleSeed.instructionsAr,
        isLegacy: false,
      },
      create: {
        name: scaleSeed.name,
        nameAr: scaleSeed.nameAr,
        descriptionAr: scaleSeed.descriptionAr,
        instructionsAr: scaleSeed.instructionsAr,
        isLegacy: false,
      },
    });

    for (const [index, question] of scaleSeed.questions.entries()) {
      const order = index + 1;
      const existing = await prisma.assessmentQuestion.findFirst({ where: { domainId: domain.id, order } });
      const data = {
        questionTextAr: question.textAr,
        optionsJson: question.options,
        reverseScored: question.reverseScored,
        isCritical: question.isCritical,
      };
      if (existing) {
        await prisma.assessmentQuestion.update({ where: { id: existing.id }, data });
      } else {
        await prisma.assessmentQuestion.create({ data: { domainId: domain.id, order, ...data } });
      }
    }
  }
  console.log('تم زرع مقياسي GAD-7 (7 بنود) وEPDS (10 بنود) المعياريين');

  for (const [index, tipTextAr] of DAILY_TIPS_SEED.entries()) {
    await prisma.dailyTip.upsert({
      where: { tipNumber: index + 1 },
      update: { tipTextAr },
      create: { tipNumber: index + 1, tipTextAr },
    });
  }
  console.log(`تم زرع ${DAILY_TIPS_SEED.length} نصيحة يومية`);

  for (const [index, tip] of WELLNESS_TIPS_SEED.entries()) {
    await prisma.wellnessTip.upsert({
      where: { tipNumber: index + 1 },
      update: { category: tip.category, tipTextAr: tip.tipTextAr },
      create: { tipNumber: index + 1, category: tip.category, tipTextAr: tip.tipTextAr },
    });
  }
  console.log(`تم زرع ${WELLNESS_TIPS_SEED.length} نصيحة إشعار يومي`);

  for (const reasonText of CONSULTATION_REASONS_SEED) {
    const existing = await prisma.consultationReason.findFirst({ where: { reasonText } });
    if (!existing) {
      await prisma.consultationReason.create({ data: { reasonText } });
    }
  }
  console.log(`تم زرع ${CONSULTATION_REASONS_SEED.length} أسباب حجز`);

  for (const pricing of SERVICE_PRICING_SEED) {
    await prisma.servicePricing.upsert({
      where: {
        serviceKind_consultationType: {
          serviceKind: pricing.serviceKind,
          consultationType: pricing.consultationType,
        },
      },
      update: { price: pricing.price },
      create: pricing,
    });
  }
  console.log(`تم زرع ${SERVICE_PRICING_SEED.length} أسعار خدمات ثابتة`);

  const specialistPasswordHash = await bcrypt.hash('Specialist@12345', SALT_ROUNDS);
  for (const spec of SPECIALISTS_SEED) {
    const user = await prisma.user.upsert({
      where: { phone: spec.phone },
      update: {},
      create: {
        phone: spec.phone,
        email: spec.email,
        passwordHash: specialistPasswordHash,
        role: UserRole.specialist,
        wilaya: spec.wilaya,
      },
    });

    const specialist = await prisma.specialist.upsert({
      where: { userId: user.id },
      update: {
        fullName: spec.fullName,
        specialty: spec.specialty,
        status: SpecialistStatus.approved,
        photoUrl: spec.photoUrl,
        track: spec.track,
      },
      create: {
        userId: user.id,
        fullName: spec.fullName,
        specialty: spec.specialty,
        bio: spec.bio,
        yearsExperience: spec.yearsExperience,
        status: SpecialistStatus.approved,
        photoUrl: spec.photoUrl,
        track: spec.track,
      },
    });

    for (const slot of spec.slots) {
      const startTime = new Date();
      startTime.setDate(startTime.getDate() + slot.daysFromNow);
      startTime.setHours(slot.hour, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + slot.durationHours);

      const existingSlot = await prisma.specialistAvailability.findUnique({
        where: { specialistId_startTime: { specialistId: specialist.id, startTime } },
      });
      if (!existingSlot) {
        await prisma.specialistAvailability.create({
          data: {
            specialistId: specialist.id,
            startTime,
            endTime,
            consultationType: slot.type,
            wilaya: slot.type === ConsultationType.in_person ? slot.wilaya : null,
          },
        });
      }
    }

    // حذف أي دورة قديمة لهذه الأخصائية لم تعد ضمن قائمة spec.courses الحالية — استبدال
    // كامل عند تغيير العناوين بدل التراكم فوق دورات قديمة بعناوين لم تعد مطلوبة.
    // onDelete: Cascade على CourseEnrollment يحذف أي تسجيل قديم مرتبط تلقائيًا (بيئة seed
    // تجريبية، لا بيانات إنتاج حقيقية)
    if (spec.courses) {
      const currentTitles = spec.courses.map((c) => c.title);
      await prisma.course.deleteMany({
        where: { specialistId: specialist.id, title: { notIn: currentTitles } },
      });
    }

    // الدورات التجريبية للأخصائيين الجدد — السعر يُقرأ من SERVICE_PRICING_SEED مباشرة
    // (نفس القيم التي يقرأها CoursesService.getServicePrice فعليًا)، لا رقمًا مبعثرًا هنا
    for (const course of spec.courses ?? []) {
      const existing = await prisma.course.findFirst({ where: { specialistId: specialist.id, title: course.title } });
      if (existing) continue;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() + course.daysFromNow);
      startDate.setHours(9, 0, 0, 0);
      const price = SERVICE_PRICING_SEED.find(
        (p) => p.serviceKind === ServiceKind.course && p.consultationType === course.type,
      )!.price;

      await prisma.course.create({
        data: {
          specialistId: specialist.id,
          title: course.title,
          description: course.description,
          type: course.type,
          capacity: course.type === ConsultationType.in_person ? (course.capacity ?? null) : null,
          startDate,
          durationText: course.durationText,
          durationDays: course.durationDays,
          price,
          contentUrl: course.type === ConsultationType.remote ? course.contentUrl : null,
          wilaya: course.type === ConsultationType.in_person ? course.wilaya : null,
        },
      });
    }
  }
  console.log(`تم زرع ${SPECIALISTS_SEED.length} أخصائيين معتمدين بفترات توفر ودورات تجريبية عبر المسارات الثلاثة`);
  console.log('بيانات دخول الأخصائيين التجريبيين: 0500000001 (نفسية) / 0500000002 (نفسية) / 0500000003 (نفسية) / 0500000006 (نفسية) / 0500000007 (نفسية) / 0500000004 (صحية) / 0500000005 (غذائية) — كلمة المرور: Specialist@12345');

  const adminPasswordHash = await bcrypt.hash('AdminTeam@2026', SALT_ROUNDS);
  for (const admin of ADMINS_SEED) {
    // update صريح لكلمة المرور أيضًا — بعض هذه الحسابات (مثل 0500000000) قد تكون
    // موجودة من زرع سابق بكلمة مرور مختلفة، ونريد تقاربًا مضمونًا لكلمة مرور واحدة موحدة
    const user = await prisma.user.upsert({
      where: { phone: admin.phone },
      update: { passwordHash: adminPasswordHash, role: UserRole.admin },
      create: {
        phone: admin.phone,
        email: admin.email,
        passwordHash: adminPasswordHash,
        role: UserRole.admin,
        wilaya: 'الجزائر العاصمة',
      },
    });
    await prisma.adminProfile.upsert({
      where: { userId: user.id },
      update: { fullName: admin.fullName },
      create: { userId: user.id, fullName: admin.fullName },
    });
  }
  console.log(
    `تم إنشاء/التأكد من ${ADMINS_SEED.length} حسابات admin تجريبية (${ADMINS_SEED.map((a) => a.phone).join(' / ')}) — كلمة المرور: AdminTeam@2026`,
  );

  for (const plan of SUBSCRIPTION_PLANS_SEED) {
    await prisma.subscriptionPlan.upsert({
      where: { code: plan.code },
      update: {
        nameAr: plan.nameAr,
        price: plan.price,
        type: plan.type,
        bookingCredits: plan.bookingCredits,
        courseCredits: plan.courseCredits,
        unlimitedBookings: plan.unlimitedBookings,
        featuresJson: plan.featuresJson,
      },
      create: {
        code: plan.code,
        nameAr: plan.nameAr,
        price: plan.price,
        type: plan.type,
        bookingCredits: plan.bookingCredits,
        courseCredits: plan.courseCredits,
        unlimitedBookings: plan.unlimitedBookings,
        featuresJson: plan.featuresJson,
      },
    });
  }
  console.log(`تم زرع ${SUBSCRIPTION_PLANS_SEED.length} باقات اشتراك`);

  // بداية الأسبوع الحالي بنفس منطق NutritionService.getCurrentWeekStart() تمامًا (الأحد 00:00 UTC)
  // حتى تظهر الوجبات المزروعة فعليًا في GET /weekly-meals/current-week فور تشغيل الـseed
  const now = new Date();
  const currentWeekStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - now.getUTCDay()));
  for (const meal of WEEKLY_MEALS_SEED) {
    const existing = await prisma.weeklyMeal.findFirst({
      where: { weekStartDate: currentWeekStart, dayOfWeek: meal.dayOfWeek, mealType: meal.mealType },
    });
    if (existing) {
      // كان هذا التحديث يُحدّث imageUrl فقط ويترك الاسم/الوصف/السعر القديمة كما هي — لو
      // بقي على حاله لَما ظهر المنيو الجديد فعليًا عند إعادة تشغيل الـseed (اكتُشف أثناء
      // تنفيذ طلب استبدال المنيو الكامل، نفس عائلة الخلل الذي أُصلح سابقًا في seed الأخصائيين)
      await prisma.weeklyMeal.update({
        where: { id: existing.id },
        data: {
          name: meal.name,
          description: meal.description,
          price: meal.price,
          imageUrl: meal.imageUrl,
        },
      });
    } else {
      await prisma.weeklyMeal.create({
        data: {
          weekStartDate: currentWeekStart,
          dayOfWeek: meal.dayOfWeek,
          mealType: meal.mealType,
          name: meal.name,
          description: meal.description,
          price: meal.price,
          imageUrl: meal.imageUrl,
        },
      });
    }
  }
  console.log(`تم زرع ${WEEKLY_MEALS_SEED.length} وجبة لأسبوع بدايته ${currentWeekStart.toISOString().slice(0, 10)}`);

  for (const service of HOME_SERVICES_SEED) {
    const existing = await prisma.homeService.findFirst({ where: { name: service.name } });
    if (existing) {
      await prisma.homeService.update({ where: { id: existing.id }, data: { imageUrl: service.imageUrl } });
    } else {
      await prisma.homeService.create({ data: service });
    }
  }
  console.log(`تم زرع ${HOME_SERVICES_SEED.length} خدمات منزلية`);

  for (const product of PRODUCTS_SEED) {
    const existing = await prisma.product.findFirst({ where: { name: product.name } });
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data: { imageUrl: product.imageUrl } });
    } else {
      await prisma.product.create({ data: product });
    }
  }
  console.log(`تم زرع ${PRODUCTS_SEED.length} منتج في المتجر`);

  const testimonialAuthorPasswordHash = await bcrypt.hash('Mother@12345', SALT_ROUNDS);
  for (const t of TESTIMONIALS_SEED) {
    const author = await prisma.user.upsert({
      where: { phone: t.phone },
      update: {},
      create: {
        phone: t.phone,
        passwordHash: testimonialAuthorPasswordHash,
        role: UserRole.mother,
        wilaya: t.wilaya,
      },
    });

    const existing = await prisma.testimonial.findFirst({ where: { userId: author.id } });
    if (!existing) {
      await prisma.testimonial.create({
        data: {
          userId: author.id,
          content: t.content,
          rating: t.rating,
          displayName: t.displayName,
          isApproved: true,
        },
      });
    }
  }
  console.log(`تم زرع ${TESTIMONIALS_SEED.length} آراء أمهات معتمدة`);

  // الدولا الرقمية: تمريرة أولى لإنشاء الفئات والأسئلة، ثم تمريرة ثانية لربط أسئلة
  // المتابعة المقترحة (relatedEntryIds) بعد أن تصبح المعرّفات الحقيقية معروفة
  const faqCategoryIdByKey = new Map<string, string>();
  for (const cat of FAQ_CATEGORIES_SEED) {
    const existing = await prisma.faqCategory.findFirst({ where: { nameAr: cat.nameAr } });
    const category = existing
      ? await prisma.faqCategory.update({
          where: { id: existing.id },
          data: { iconName: cat.iconName, displayOrder: cat.displayOrder },
        })
      : await prisma.faqCategory.create({
          data: { nameAr: cat.nameAr, iconName: cat.iconName, displayOrder: cat.displayOrder },
        });
    faqCategoryIdByKey.set(cat.key, category.id);
  }

  const faqEntryIdByKey = new Map<string, string>();
  for (const entry of FAQ_ENTRIES_SEED) {
    const categoryId = faqCategoryIdByKey.get(entry.categoryKey)!;
    const existing = await prisma.faqEntry.findFirst({
      where: { categoryId, questionAr: entry.questionAr },
    });
    const saved = existing
      ? await prisma.faqEntry.update({
          where: { id: existing.id },
          data: { answerAr: entry.answerAr, displayOrder: entry.displayOrder },
        })
      : await prisma.faqEntry.create({
          data: {
            categoryId,
            questionAr: entry.questionAr,
            answerAr: entry.answerAr,
            displayOrder: entry.displayOrder,
          },
        });
    faqEntryIdByKey.set(entry.key, saved.id);
  }

  for (const entry of FAQ_ENTRIES_SEED) {
    const id = faqEntryIdByKey.get(entry.key)!;
    const relatedIds = entry.relatedKeys.map((k) => faqEntryIdByKey.get(k)).filter((v): v is string => Boolean(v));
    await prisma.faqEntry.update({ where: { id }, data: { relatedEntryIds: relatedIds } });
  }
  console.log(`تم زرع ${FAQ_CATEGORIES_SEED.length} فئات و${FAQ_ENTRIES_SEED.length} سؤالًا للدولا الرقمية`);

  for (const article of ARTICLES_SEED) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        titleAr: article.titleAr,
        excerptAr: article.excerptAr,
        contentAr: article.contentAr,
        coverImageUrl: article.coverImageUrl,
        category: article.category,
        authorName: article.authorName,
        readTimeMinutes: estimateReadTimeMinutes(article.contentAr),
      },
      create: {
        titleAr: article.titleAr,
        slug: article.slug,
        excerptAr: article.excerptAr,
        contentAr: article.contentAr,
        coverImageUrl: article.coverImageUrl,
        category: article.category,
        authorName: article.authorName,
        readTimeMinutes: estimateReadTimeMinutes(article.contentAr),
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }
  console.log(`تم زرع ${ARTICLES_SEED.length} مقالات (منشورة)`);

  console.log('اكتملت عملية الزرع بنجاح.');
}

main()
  .catch((error) => {
    console.error('فشلت عملية الزرع:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
