/** مفتاح تخزين محلي موحّد للوقت المفضّل لحضور دورة — مشترك بين بطاقة القائمة وصفحة
 * التفاصيل كي يستخدما نفس المفتاح لنفس الدورة بغض النظر عن أيّهما اختارت المستخدمة منه */
export function preferredTimeStorageKey(courseId: string): string {
  return `mc_course_preferred_time_${courseId}`;
}
