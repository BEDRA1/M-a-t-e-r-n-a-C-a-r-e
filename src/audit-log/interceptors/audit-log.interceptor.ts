import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { Observable, catchError, tap, throwError } from 'rxjs';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.type';
import { AuditLogService } from '../audit-log.service';
import { AUDIT_LOG_KEY, type AuditLogMeta } from '../decorators/audit-log.decorator';

interface EntityLike {
  id?: string;
}

// interceptor عام مُسجَّل مرة واحدة على مستوى التطبيق (APP_INTERCEPTOR) — لا يفعل شيئًا
// لأي مسار غير موسوم بـ@AuditLog()، فتكلفته على بقية الـendpoints قراءة metadata فقط
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.get<AuditLogMeta | undefined>(AUDIT_LOG_KEY, context.getHandler());
    if (!meta) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user) {
      return next.handle();
    }

    const params = request.params as Record<string, string> | undefined;
    // :id هو الأشيع، لكن مسارات مثل specialist/patients/:userId تستخدم اسمًا مختلفًا —
    // البحث عن أي معرّف صالح باسم شائع بدل افتراض "id" حصرًا
    const paramEntityId = params?.id ?? params?.userId ?? params?.specialistId ?? null;
    const ip = request.ip ?? request.socket?.remoteAddress ?? null;
    const body = request.body as Record<string, unknown> | undefined;
    const baseDetails = { ...(body && Object.keys(body).length > 0 ? body : {}), ip };

    return next.handle().pipe(
      tap((result: unknown) => {
        const entity = result as EntityLike | undefined;
        const entityId = paramEntityId ?? entity?.id ?? null;

        void this.auditLogService.record({
          adminUserId: user.userId,
          action: meta.action,
          entityType: meta.entityType,
          entityId,
          details: baseDetails,
        });
      }),
      // محاولات الوصول المرفوضة (403 مثلًا) تُسجَّل أيضًا — تحديدًا لمسارات بيانات حساسة
      // مثل سجلات المريضات، حيث محاولة فاشلة قد تدل على تسريب مُحاوَل لا نجاحًا فقط
      catchError((error: unknown) => {
        void this.auditLogService.record({
          adminUserId: user.userId,
          action: `${meta.action}_failed`,
          entityType: meta.entityType,
          entityId: paramEntityId,
          details: { ...baseDetails, error: error instanceof Error ? error.message : String(error) },
        });
        return throwError(() => error);
      }),
    );
  }
}
