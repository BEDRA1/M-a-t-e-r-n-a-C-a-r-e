// ";" لا "," — Excel يقسم الأعمدة حسب فاصل القوائم في إعدادات Windows الإقليمية، وهو ";"
// في الإعدادات الفرنسية/العربية الشائعة في الجزائر. بفاصلة كان الملف سيُفتح عمودًا واحدًا
const DELIMITER = ';';
// BOM يجعل Excel يقرأ الملف UTF-8 فيظهر العربي صحيحًا بدل رموز مشوّهة
const BOM = '﻿';

/** خلية تُكتب كما هي بلا تهريب — للهاتف الكامل فقط ="0555..." كي لا يحذف Excel الصفر الأول */
export class RawCell {
  constructor(readonly value: string) {}
}

export type Cell = string | number | null | undefined | RawCell;

export function excelText(digits: string): RawCell {
  // الأرقام تأتي من حقل phone المتحقق منه (0[5-7]\d{8}) — الحماية هنا احتياط فقط
  return new RawCell(/^[0-9+]+$/.test(digits) ? `="${digits}"` : escape(digits));
}

function escape(value: string): string {
  // CSV/formula injection: نص يبدأ بـ = + - @ يُنفَّذ كصيغة في Excel — يُسبَق بـ ' ليبقى نصًا
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[";\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

function cell(value: Cell): string {
  if (value instanceof RawCell) return value.value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return String(value);
  return escape(value);
}

export function toCsv(head: string[], rows: Cell[][]): string {
  const lines = [head, ...rows].map((r) => r.map(cell).join(DELIMITER));
  return BOM + lines.join('\r\n') + '\r\n';
}

const DATE_FMT = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Africa/Algiers',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

/** "2026-10-26 14:30" بتوقيت الجزائر — صيغة يتعرّف عليها Excel كتاريخ */
export function formatDate(date: Date | null | undefined): string {
  return date ? DATE_FMT.format(date) : '';
}
