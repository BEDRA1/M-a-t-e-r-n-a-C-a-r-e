import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AssessmentsService } from './assessments.service';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiBearerAuth()
@ApiTags('assessments')
@Controller('api/v1/assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get('domains')
  @ApiOperation({ summary: 'قائمة محاور التقييم النفسي المتاحة' })
  listDomains() {
    return this.assessmentsService.listDomains();
  }

  @Get('domains/:domainId/questions')
  @ApiOperation({ summary: 'أسئلة محور تقييم معيّن' })
  getQuestions(@Param('domainId') domainId: string) {
    return this.assessmentsService.getQuestionsByDomain(domainId);
  }

  @Post('submit')
  @ApiOperation({ summary: 'إرسال إجابات محور كامل والحصول على النتيجة فورًا' })
  submit(@CurrentUser() user: AuthenticatedUser, @Body() dto: SubmitAssessmentDto) {
    return this.assessmentsService.submit(user.userId, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'سجل تقييماتي السابقة (بفلتر محور اختياري)' })
  getHistory(@CurrentUser() user: AuthenticatedUser, @Query('domain') domainId?: string) {
    return this.assessmentsService.getHistory(user.userId, domainId);
  }
}
