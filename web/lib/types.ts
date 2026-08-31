export type UserRole = "mother" | "spouse" | "admin" | "specialist";

export interface User {
  id: string;
  phone: string;
  email: string | null;
  role: UserRole;
  wilaya: string | null;
  createdAt: string;
}

export type PregnancyCalcMethod = "lmp" | "ovulation" | "ultrasound";
export type PregnancyStatus = "active" | "completed" | "ended";

export interface GestationalAge {
  weeks: number;
  days: number;
  totalDays: number;
  progressPercent: number;
}

export interface Pregnancy {
  id: string;
  motherId: string;
  calcMethod: PregnancyCalcMethod;
  lmpDate: string | null;
  conceptionDate: string | null;
  ultrasoundDate: string | null;
  ultrasoundWeeks: number | null;
  dueDate: string;
  status: PregnancyStatus;
  createdAt: string;
  gestationalAge: GestationalAge;
}

export interface WeeklyLog {
  id: string;
  pregnancyId: string;
  weekNumber: number;
  weightKg: string | null;
  symptoms: string[] | null;
  notes: string | null;
  loggedAt: string;
}

export interface WeekContent {
  id: string;
  weekNumber: number;
  babySizeComparison: string;
  babyWeightGrams: number | null;
  babyLengthCm: string | null;
  bodyChangesText: string;
  tipsJson: string[];
  developmentJson: { points?: string[] };
}

export type ReminderType = "vitamin" | "medication" | "water" | "appointment" | "other";

export interface Reminder {
  id: string;
  userId: string;
  type: ReminderType;
  title: string;
  scheduledTime: string;
  recurrence: string | null;
  isDone: boolean;
  createdAt: string;
}

export interface Family {
  id: string;
  motherUserId: string;
  spouseUserId: string | null;
  inviteCode: string;
  createdAt: string;
}

export type NotificationType =
  | "booking_confirmed"
  | "appointment_reminder"
  | "general"
  | "vaccination_reminder"
  | "daily_tip";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  sourceReminderId: string | null;
  createdAt: string;
}

export type SpecialistStatus = "pending" | "approved" | "rejected";
export type ConsultationType = "in_person" | "remote";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PaymentMethod = "card" | "ccp" | "baridimob" | "pay_at_attendance";
export type PaymentStatus = "pending" | "paid" | "failed" | "free_with_subscription";
export type SpecialistTrack = "psychological" | "health" | "nutrition";
export type ServiceKind = "consultation" | "course";

export interface ServicePricing {
  id: string;
  serviceKind: ServiceKind;
  consultationType: ConsultationType;
  price: number;
}

export interface Specialist {
  id: string;
  userId: string;
  fullName: string;
  specialty: string;
  bio: string;
  yearsExperience: number;
  photoUrl: string | null;
  status: SpecialistStatus;
  track: SpecialistTrack;
  createdAt: string;
  user?: { id: string; wilaya: string | null; phone?: string };
}

export interface SpecialistAvailabilitySlot {
  id: string;
  specialistId: string;
  startTime: string;
  endTime: string;
  consultationType: ConsultationType;
  wilaya: string | null;
  isBooked: boolean;
  createdAt: string;
  specialist?: { id: string; specialty: string; yearsExperience: number };
}

export interface ConsultationReason {
  id: string;
  reasonText: string;
  isActive: boolean;
}

export interface BookingReview {
  id: string;
  bookingId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  specialistId: string;
  availabilitySlotId: string;
  consultationType: ConsultationType;
  reasonId: string;
  questionnaireAnswers: Record<string, unknown> | null;
  status: BookingStatus;
  videoLink: string | null;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  createdAt: string;
  specialist?: Specialist;
  reason?: ConsultationReason;
  availabilitySlot?: SpecialistAvailabilitySlot;
  review?: BookingReview | null;
  user?: { id: string; phone: string };
}

export interface PostpartumPeriod {
  id: string;
  motherId: string;
  pregnancyId: string;
  birthDate: string;
  createdAt: string;
  dayCount: number;
}

export interface PostpartumMoodLog {
  id: string;
  postpartumPeriodId: string;
  moodLevel: number;
  notes: string | null;
  loggedAt: string;
}

export interface MoodLog {
  id: string;
  userId: string;
  moodLevel: number;
  notes: string | null;
  logDate: string;
  loggedAt: string;
}

export interface Testimonial {
  id: string;
  content: string;
  rating: number;
  displayName: string | null;
  createdAt: string;
}

export interface AdminTestimonial extends Testimonial {
  userId: string;
  isApproved: boolean;
}

export interface FaqCategory {
  id: string;
  nameAr: string;
  iconName: string;
  displayOrder: number;
}

export interface FaqEntry {
  id: string;
  categoryId: string;
  questionAr: string;
  answerAr: string;
  displayOrder: number;
  isActive: boolean;
}

export interface FaqEntryWithRelated extends FaqEntry {
  relatedEntries: FaqEntry[];
}

export type BabyGender = "male" | "female";

export interface BabyCheckup {
  id: string;
  babyId: string;
  title: string;
  scheduledDate: string;
  notes: string | null;
  completed: boolean;
  linkedReminderId: string | null;
  createdAt: string;
}

export interface Baby {
  id: string;
  familyId: string;
  fullName: string;
  birthDate: string;
  gender: BabyGender;
  weightGrams: number | null;
  heightCm: string | null;
  createdAt: string;
  checkups?: BabyCheckup[];
}

export interface DailyTip {
  id: string;
  tipNumber: number;
  tipTextAr: string;
}

export type AssessmentDomainName =
  | "anxiety"
  | "depression"
  | "stress"
  | "pressure"
  | "sleep"
  | "gad7"
  | "epds"
  | "ptsd";

export type AssessmentClassification =
  | "low"
  | "medium"
  | "high"
  | "minimal"
  | "mild"
  | "moderate"
  | "severe"
  | "needs_followup"
  | "very_high";

export interface AssessmentDomain {
  id: string;
  name: AssessmentDomainName;
  nameAr: string;
  descriptionAr: string | null;
  instructionsAr: string | null;
  isLegacy: boolean;
}

export interface AssessmentQuestion {
  id: string;
  domainId: string;
  questionTextAr: string;
  order: number;
  optionsJson: string[] | null;
  reverseScored: boolean;
  isCritical: boolean;
}

export interface AssessmentAnswerInput {
  questionId: string;
  value: number;
}

export interface AssessmentResultAnswer {
  questionId: string;
  rawValue: number;
  scoredValue: number;
}

export interface AssessmentResult {
  id: string;
  userId: string;
  domainId: string;
  totalScore: number;
  classification: AssessmentClassification;
  answers: AssessmentResultAnswer[];
  takenAt: string;
  domain?: AssessmentDomain;
}

export interface SubmitAssessmentResponse extends AssessmentResult {
  domain: AssessmentDomain;
  disclaimerText: string;
  requiresUrgentHelp: boolean;
  urgentHelpRequest: UrgentHelpRequest | null;
}

export type UrgentHelpTriggerSource = "epds_critical_item" | "manual_button" | "assessment_score_threshold";
export type UrgentHelpStatus = "open" | "contacted" | "closed";

export interface UrgentHelpRequest {
  id: string;
  userId: string;
  triggerSource: UrgentHelpTriggerSource;
  assessmentResultId: string | null;
  status: UrgentHelpStatus;
  createdAt: string;
  notes: string | null;
  user?: { id: string; phone: string };
  assessmentResult?: { id: string; domainId: string; totalScore: number; classification: AssessmentClassification };
}

export type MealType = "lunch" | "dinner";
export type MealOrderStatus = "pending" | "confirmed" | "out_for_delivery" | "delivered" | "cancelled";

export interface WeeklyMeal {
  id: string;
  dayOfWeek: number;
  mealType: MealType;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  weekStartDate: string;
  createdAt: string;
}

export interface MealOrderItem {
  id: string;
  orderId: string;
  mealId: string;
  quantity: number;
  unitPrice: number;
  meal?: WeeklyMeal;
}

export interface MealOrder {
  id: string;
  userId: string;
  totalPrice: number;
  deliveryAddress: string;
  preferredTime: string;
  status: MealOrderStatus;
  createdAt: string;
  items: MealOrderItem[];
}

export interface HomeService {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  imageUrl: string | null;
  createdAt: string;
}

export type ServiceBookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface ServiceBooking {
  id: string;
  userId: string;
  serviceId: string;
  scheduledTime: string;
  address: string;
  notes: string | null;
  status: ServiceBookingStatus;
  createdAt: string;
  service?: HomeService;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  stockQuantity: number;
  createdAt: string;
}

export type ProductOrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface ProductOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: Product;
}

export interface ProductOrder {
  id: string;
  userId: string;
  totalPrice: number;
  deliveryAddress: string;
  status: ProductOrderStatus;
  createdAt: string;
  items: ProductOrderItem[];
}

export type SubscriptionType = "monthly" | "one_time";
export type SubscriptionStatus = "active" | "expired" | "cancelled";
export type SubscriptionPaymentMethod = "visa" | "baridimob";
export type TransactionStatus = "pending" | "succeeded" | "failed";

export interface SubscriptionPlan {
  id: string;
  code: string;
  nameAr: string;
  price: number;
  currency: string;
  type: SubscriptionType;
  bookingCredits: number;
  courseCredits: number;
  unlimitedBookings: boolean;
  featuresJson: string[];
  createdAt: string;
}

export interface SubscriptionTransaction {
  id: string;
  userSubscriptionId: string;
  amount: number;
  paymentMethod: SubscriptionPaymentMethod;
  paymentProviderRef: string;
  status: TransactionStatus;
  createdAt: string;
}

export interface Course {
  id: string;
  specialistId: string;
  title: string;
  description: string;
  type: ConsultationType;
  capacity: number | null;
  enrolledCount: number;
  startDate: string;
  durationText: string;
  durationDays: number;
  price: number;
  contentUrl: string | null;
  wilaya: string | null;
  specialist?: { id: string; fullName: string; specialty: string; track?: SpecialistTrack };
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  userId: string;
  isFree: boolean;
  certificateIssued: boolean;
  certificateIssuedAt: string | null;
  createdAt: string;
  course?: Course;
  user?: { id: string; phone: string };
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt: string | null;
  bookingCreditsRemaining: number;
  courseCreditsRemaining: number;
  paymentIntentId: string | null;
  createdAt: string;
  plan: SubscriptionPlan;
  transactions?: SubscriptionTransaction[];
}

export interface AdminAuditLog {
  id: string;
  adminUserId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
  adminUser: {
    phone: string;
    role: UserRole;
    adminProfile: { fullName: string } | null;
  };
}

export interface AdminAuditLogPage {
  items: AdminAuditLog[];
  total: number;
  page: number;
  pageSize: number;
}

export type ArticleCategory =
  | "pregnancy"
  | "birth"
  | "postpartum"
  | "baby_health"
  | "nutrition"
  | "mental_health";

export interface Article {
  id: string;
  titleAr: string;
  slug: string;
  excerptAr: string;
  contentAr: string;
  coverImageUrl: string;
  category: ArticleCategory;
  authorName: string;
  isPublished: boolean;
  publishedAt: string | null;
  readTimeMinutes: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleWithRelated extends Article {
  relatedArticles: Article[];
}

export interface ArticlePage {
  items: Article[];
  total: number;
}

export interface DataSharingSettings {
  id?: string;
  userId: string;
  specialistId: string;
  shareMoodLogs: boolean;
  shareAssessments: boolean;
  sharePregnancyData: boolean;
  sharePostpartumData: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientSharingFlags {
  moodLogs: boolean;
  assessments: boolean;
  pregnancyData: boolean;
  postpartumData: boolean;
}

export interface SpecialistPatientSummary {
  userId: string;
  maskedPhone: string;
  sessionCount: number;
  lastBookingAt: string;
  sharing: PatientSharingFlags;
}

export interface PatientQuestionnaireEntry {
  bookingId: string;
  sessionDate: string;
  answers: Record<string, unknown>;
}

export interface PatientMoodLogEntry {
  logDate: string;
  moodLevel: number;
}

export interface PatientAssessmentEntry {
  id: string;
  totalScore: number;
  classification: string;
  takenAt: string;
  domain: { name: string; nameAr: string };
}

export interface PatientPregnancySummary {
  weeks: number;
  days: number;
  progressPercent: number;
  dueDate: string;
}

export interface PatientPostpartumSummary {
  dayCount: number;
  birthDate: string;
}

export interface SpecialistPatientDetail {
  sharingEnabled: PatientSharingFlags;
  questionnaires: PatientQuestionnaireEntry[];
  moodLogs?: PatientMoodLogEntry[];
  assessments?: PatientAssessmentEntry[];
  pregnancy?: PatientPregnancySummary | null;
  postpartum?: PatientPostpartumSummary | null;
}

export interface ClinicalNote {
  id: string;
  bookingId: string;
  specialistId: string;
  patientUserId: string;
  noteText: string;
  sessionDate: string;
  createdAt: string;
  updatedAt: string;
}
