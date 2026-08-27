import { HttpException, HttpStatus } from '@nestjs/common';
import { BilingualMessage } from '../i18n/bilingual-message.type';

// كل الأخطاء المتعلقة بمنطق العمل يجب أن تُرمى عبر AppException لضمان توفر رسالة عربية وإنجليزية معًا
export class AppException extends HttpException {
  constructor(status: HttpStatus, messages: BilingualMessage, errorCode?: string) {
    super({ messages, errorCode }, status);
  }
}
