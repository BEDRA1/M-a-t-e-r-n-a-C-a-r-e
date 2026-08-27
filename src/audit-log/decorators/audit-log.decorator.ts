import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG_KEY = 'auditLog';

export interface AuditLogMeta {
  action: string;
  entityType: string;
}

// يُلصَق على أي endpoint يغيّر شيئًا أو يمس بيانات حساسة — AuditLogInterceptor العام
// يقرأ هذه البيانات الوصفية بعد نجاح التنفيذ فقط، فلا حاجة لتكرار كود التسجيل في كل service
export const AuditLog = (action: string, entityType: string) =>
  SetMetadata(AUDIT_LOG_KEY, { action, entityType } satisfies AuditLogMeta);
