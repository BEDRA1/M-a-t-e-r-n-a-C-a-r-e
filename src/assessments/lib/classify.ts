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

export const ASSESSMENT_DISCLAIMER_AR =
  'هذه المقاييس تُستخدم للفحص والتقييم النفسي الأولي فقط، ولا تُعدّ بديلًا عن التشخيص والتقييم السريري المتخصص.';
