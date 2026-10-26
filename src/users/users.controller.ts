import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { SetUserActiveDto } from './dto/set-user-active.dto';
import { ChangeUserRoleDto } from './dto/change-user-role.dto';
import { CreateSpecialistAccountDto } from './dto/create-specialist-account.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuditLog } from '../audit-log/decorators/audit-log.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

// كل المسارات هنا للإدارة فقط — مطبّق على مستوى المتحكم كي لا يُنسى على أي مسار يُضاف لاحقًا
@ApiBearerAuth()
@ApiTags('users')
@Controller('api/v1/users')
@Roles(UserRole.admin)
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'قائمة كل المستخدمين مع عدد حجوزاتهم (الإدارة فقط)، بفلتر role اختياري' })
  listAll(@Query() query: QueryUsersDto) {
    return this.usersService.listAll(query.role);
  }

  // مسار حرفي قبل ':id' الديناميكي
  @Post('specialists')
  @AuditLog('create_specialist_account', 'user')
  @ApiOperation({ summary: 'إنشاء حساب أخصائية معتمدة مباشرة بكلمة مرور مؤقتة' })
  createSpecialist(@Body() dto: CreateSpecialistAccountDto) {
    return this.usersService.createSpecialistAccount(dto);
  }

  @Get(':id')
  @AuditLog('view_user_details', 'user')
  @ApiOperation({ summary: 'تفاصيل مستخدم: بياناته وحجوزاته واشتراكاته وطلباته (بلا بيانات طبية)' })
  getDetails(@Param('id') id: string) {
    return this.usersService.getDetails(id);
  }

  @Patch(':id/active')
  @AuditLog('set_user_active', 'user')
  @ApiOperation({ summary: 'تعطيل/تفعيل حساب — التعطيل يحذف جلساته فورًا' })
  setActive(@CurrentUser() admin: AuthenticatedUser, @Param('id') id: string, @Body() dto: SetUserActiveDto) {
    return this.usersService.setActive(admin.userId, id, dto.isActive);
  }

  @Patch(':id/role')
  @AuditLog('change_user_role', 'user')
  @ApiOperation({ summary: 'تغيير دور مستخدم — لا يمكن للأدمن إزالة دوره عن نفسه' })
  changeRole(@CurrentUser() admin: AuthenticatedUser, @Param('id') id: string, @Body() dto: ChangeUserRoleDto) {
    return this.usersService.changeRole(admin.userId, id, dto.role);
  }
}
