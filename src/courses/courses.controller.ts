import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ConsultationType, SpecialistTrack, UserRole } from '@prisma/client';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiBearerAuth()
@ApiTags('courses')
@Controller('api/v1/courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(UserRole.specialist)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'إنشاء دورة تكوينية جديدة (أخصائي معتمد فقط)' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCourseDto) {
    return this.coursesService.create(user.userId, dto);
  }

  @Get()
  @ApiQuery({ name: 'type', required: false, enum: ConsultationType })
  @ApiQuery({ name: 'upcoming', required: false, type: Boolean })
  @ApiQuery({ name: 'track', required: false, enum: SpecialistTrack })
  @ApiOperation({ summary: 'قائمة الدورات العامة، مع فلترة اختيارية بالنوع أو القادمة فقط أو مسار الأخصائي المالك' })
  listAll(
    @Query('type') type?: ConsultationType,
    @Query('upcoming') upcoming?: string,
    @Query('track') track?: SpecialistTrack,
  ) {
    return this.coursesService.listAll({ type, upcomingOnly: upcoming === 'true', track });
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل دورة' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.specialist)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'تعديل دورة (المالك فقط)' })
  update(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(user.userId, id, dto);
  }

  @Post(':id/enroll')
  @Roles(UserRole.mother, UserRole.spouse)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'التسجيل في دورة — خصم تلقائي من course credit إن وُجد اشتراك نشط' })
  enroll(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.coursesService.enroll(user.userId, id);
  }

  @Get(':id/enrollments')
  @Roles(UserRole.specialist)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'قائمة المسجلين في الدورة (المالك الأخصائي فقط)' })
  listEnrollments(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.coursesService.listEnrollments(user.userId, id);
  }

  @Post(':id/enrollments/:enrollmentId/certificate')
  @Roles(UserRole.specialist)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'إصدار شهادة إتمام لتسجيل بعد اكتمال الدورة (المالك فقط)' })
  issueCertificate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('enrollmentId') enrollmentId: string,
  ) {
    return this.coursesService.issueCertificate(user.userId, id, enrollmentId);
  }
}
