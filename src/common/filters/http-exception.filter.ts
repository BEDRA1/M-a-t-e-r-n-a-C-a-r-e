import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BilingualMessage } from '../i18n/bilingual-message.type';

function pickLanguage(req: Request): 'ar' | 'en' {
  const header = req.headers['accept-language'];
  if (typeof header === 'string' && header.toLowerCase().startsWith('en')) {
    return 'en';
  }
  // العربية هي اللغة الافتراضية للمنصة (بيئة جزائرية)
  return 'ar';
}

const GENERIC_ERROR: BilingualMessage = {
  ar: 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً',
  en: 'An unexpected error occurred, please try again later',
};

const STATUS_FALLBACK_MESSAGES: Partial<Record<number, BilingualMessage>> = {
  [HttpStatus.BAD_REQUEST]: {
    ar: 'بيانات غير صالحة، يرجى مراجعة الحقول المُرسلة',
    en: 'Invalid input data, please check the submitted fields',
  },
  [HttpStatus.UNAUTHORIZED]: {
    ar: 'يجب تسجيل الدخول للوصول إلى هذا المورد',
    en: 'You must be logged in to access this resource',
  },
  [HttpStatus.FORBIDDEN]: {
    ar: 'ليس لديك صلاحية للوصول إلى هذا المورد',
    en: 'You do not have permission to access this resource',
  },
  [HttpStatus.NOT_FOUND]: {
    ar: 'المورد المطلوب غير موجود',
    en: 'The requested resource was not found',
  },
  [HttpStatus.TOO_MANY_REQUESTS]: {
    ar: 'تجاوزت الحد المسموح، حاولي لاحقاً',
    en: 'Too many requests, please try again later',
  },
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const lang = pickLanguage(request);

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;
    let errorCode: string | undefined;
    let details: unknown;
    // أخطاء غير متوقعة (استثناء Prisma خام أو أي خطأ JS آخر لم يُصمَّم كـHttpException) قد
    // تحمل اسم جدول أو بنية استعلام أو مسار ملف — لا تُكشَف مطلقًا في الإنتاج. في التطوير
    // فقط تُضاف تحت حقل debug منفصل (لا message نفسها) ليبقى شكل الاستجابة كما هو دائمًا
    let debug: { name: string; message: string; stack?: string } | undefined;

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (typeof body === 'object' && body !== null && 'messages' in body) {
        // AppException: يحمل رسالة ثنائية اللغة جاهزة
        const typed = body as { messages: BilingualMessage; errorCode?: string };
        message = typed.messages[lang];
        errorCode = typed.errorCode;
      } else if (typeof body === 'object' && body !== null && 'message' in body) {
        // أخطاء NestJS الافتراضية (مثل ValidationPipe أو AuthGuard) تبقى تفصيلية بالإنجليزية للمطورين
        const typed = body as { message: string | string[] };
        details = typed.message;
        message = (STATUS_FALLBACK_MESSAGES[status] ?? GENERIC_ERROR)[lang];
      } else {
        // استثناءات بجسم نصي خام (مثل ThrottlerException: HttpException(message) بلا كائن) —
        // نفس منطق الفرع السابق: تُفضَّل رسالة عربية جاهزة لهذه الحالة إن وُجدت، والنص
        // الخام الأصلي (عادة إنجليزي تقني) يُنقَل إلى details بدل عرضه كرسالة رئيسية
        const fallback = STATUS_FALLBACK_MESSAGES[status];
        if (fallback) {
          details = typeof body === 'string' ? body : undefined;
          message = fallback[lang];
        } else {
          message = typeof body === 'string' ? body : GENERIC_ERROR[lang];
        }
      }
    } else {
      message = GENERIC_ERROR[lang];
      if (process.env.NODE_ENV !== 'production' && exception instanceof Error) {
        debug = { name: exception.name, message: exception.message, stack: exception.stack };
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      errorCode,
      details,
      ...(debug ? { debug } : {}),
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
