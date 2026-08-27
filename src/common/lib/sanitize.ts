import sanitizeHtml from 'sanitize-html';
import { Transform } from 'class-transformer';

const LIMITED_TAGS = ['p', 'b', 'i', 'ul', 'li', 'br'];

/** يحذف كل HTML tags — نص خام فقط. للحقول الحساسة (ملاحظات كلينيكية، إجابات الأسئلة الشائعة...) */
export function sanitizePlainText(value: string): string {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();
}

/** يسمح فقط بوسوم تنسيق نصي بسيطة (p, b, i, ul, li, br) — لمحتوى مقالات طويل، لا سكربتات أو روابط أو صور */
export function sanitizeLimitedHtml(value: string): string {
  return sanitizeHtml(value, { allowedTags: LIMITED_TAGS, allowedAttributes: {} }).trim();
}

// ValidationPipe (transform: true) يحوّل الكائن أولًا (plainToInstance، حيث تُطبَّق كل
// @Transform) ثم يتحقق منه (class-validator) في تمريرة منفصلة لاحقة — فالتنظيف هنا يسبق
// أي فحص مثل @MinLength دائمًا، بغض النظر عن ترتيب الـdecorators في الكود، وهذا مقصود:
// لا يمكن تمرير نص قصير جدًا مموَّه بوسوم HTML تُحذف لاحقًا لتجاوز حد الطول الأدنى
function makeSanitizeDecorator(fn: (value: string) => string) {
  return () =>
    Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? fn(value) : value));
}

export const SanitizeText = makeSanitizeDecorator(sanitizePlainText);
export const SanitizeLimitedHtml = makeSanitizeDecorator(sanitizeLimitedHtml);

/** لمصفوفات نصوص حرة (مثل أعراض أسبوعية يكتبها المستخدم بنفسه) — نص خام لكل عنصر */
export function SanitizeTextArray() {
  return Transform(({ value }: { value: unknown }) =>
    Array.isArray(value) ? value.map((item) => (typeof item === 'string' ? sanitizePlainText(item) : item)) : value,
  );
}
