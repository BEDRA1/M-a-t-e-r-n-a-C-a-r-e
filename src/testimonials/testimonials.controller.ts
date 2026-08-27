import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuditLog } from '../audit-log/decorators/audit-log.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiTags('testimonials')
@Controller('api/v1/testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.mother, UserRole.spouse)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'مشاركة رأي — يُنشر بعد مراجعة الإدارة' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateTestimonialDto) {
    return this.testimonialsService.create(user.userId, dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'الآراء المعتمدة فقط — عام، لصفحة الهبوط' })
  listApproved() {
    return this.testimonialsService.listApproved();
  }
}

@ApiBearerAuth()
@ApiTags('admin-testimonials')
@Controller('api/v1/admin/testimonials')
export class AdminTestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  @Roles(UserRole.admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'كل الآراء (بانتظار المراجعة والمعتمدة والمرفوضة) — للأدمن' })
  listAll() {
    return this.testimonialsService.listAllForAdmin();
  }

  @Patch(':id/approve')
  @Roles(UserRole.admin)
  @UseGuards(RolesGuard)
  @AuditLog('approve_testimonial', 'testimonial')
  @ApiOperation({ summary: 'اعتماد رأي لعرضه للعامة' })
  approve(@Param('id') id: string) {
    return this.testimonialsService.approve(id);
  }

  @Patch(':id/reject')
  @Roles(UserRole.admin)
  @UseGuards(RolesGuard)
  @AuditLog('reject_testimonial', 'testimonial')
  @ApiOperation({ summary: 'رفض رأي — لا يظهر للعامة' })
  reject(@Param('id') id: string) {
    return this.testimonialsService.reject(id);
  }
}
