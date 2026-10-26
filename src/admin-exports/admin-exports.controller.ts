import { Controller, Get, Param, ParseEnumPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AdminExportsService, EXPORT_KINDS, type ExportKind } from './admin-exports.service';

const KIND_ENUM = Object.fromEntries(EXPORT_KINDS.map((k) => [k, k]));

// يُرجع JSON {filename, content} لا text/csv خامًا: وسيط الواجهة (/api/backend) يمرّر JSON فقط،
// والمتصفح يبني الملف من content (مع الـBOM) — بلا تعديل على مسار المصادقة في الوسيط
@ApiBearerAuth()
@ApiTags('admin-exports')
@Controller('api/v1/admin/exports')
@Roles(UserRole.admin)
@UseGuards(RolesGuard)
export class AdminExportsController {
  constructor(private readonly exportsService: AdminExportsService) {}

  @Get(':kind')
  @ApiParam({ name: 'kind', enum: EXPORT_KINDS })
  @ApiOperation({ summary: 'تصدير CSV (UTF-8 مع BOM، فاصل ;) للمستخدمين أو الحجوزات أو الاشتراكات أو الطلبات' })
  export(
    @CurrentUser() user: AuthenticatedUser,
    @Param('kind', new ParseEnumPipe(KIND_ENUM)) kind: ExportKind,
  ) {
    return this.exportsService.export(user.userId, kind);
  }
}
