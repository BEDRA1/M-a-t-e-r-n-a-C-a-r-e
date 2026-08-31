import { AssessmentClassification } from '@prisma/client';

/**
 * تصنيف GAD-7 الرسمي (Spitzer et al., 2006) — المجموع بين 0 و21.
 */
export function classifyGad7(totalScore: number): AssessmentClassification {
  if (totalScore <= 4) return AssessmentClassification.minimal;
  if (totalScore <= 9) return AssessmentClassification.mild;
  if (totalScore <= 14) return AssessmentClassification.moderate;
  return AssessmentClassification.severe;
}

/**
 * تصنيف EPDS الرسمي (Cox, Holden & Sagovsky, 1987) — المجموع بين 0 و30.
 * ملاحظة: هذا التصنيف مستقل تمامًا عن بروتوكول السلامة الخاص بالبند العاشر
 * (إيذاء النفس) — الأخير يُفعَّل بناءً على درجة ذلك البند وحده بغض النظر عن
 * المجموع الكلي هنا، ويُحسب في AssessmentsService.submit لا هنا.
 */
export function classifyEpds(totalScore: number): AssessmentClassification {
  if (totalScore <= 9) return AssessmentClassification.low;
  if (totalScore <= 12) return AssessmentClassification.needs_followup;
  return AssessmentClassification.high;
}

/**
 * تصنيف مقياس ما بعد الصدمة التالية للولادة (فاضل آية وبن الشارف فلة، 2026) —
 * 28 بندًا على مقياس 5 نقاط (0-4)، المجموع بين 0 و112.
 * ملاحظة: بروتوكول السلامة هنا مبني على عتبة المجموع الكلي (>85) لا بند حرج فردي
 * كما في EPDS — يُحسب في AssessmentsService.submit لا هنا.
 */
export function classifyPtsd(totalScore: number): AssessmentClassification {
  if (totalScore <= 28) return AssessmentClassification.low;
  if (totalScore <= 56) return AssessmentClassification.medium;
  if (totalScore <= 84) return AssessmentClassification.high;
  return AssessmentClassification.very_high;
}

export const PTSD_SAFETY_THRESHOLD = 85;

export const ASSESSMENT_DISCLAIMER_AR =
  'هذه المقاييس تُستخدم للفحص والتقييم النفسي الأولي فقط، ولا تُعدّ بديلًا عن التشخيص والتقييم السريري المتخصص.';
