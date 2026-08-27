import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiBearerAuth()
@ApiTags('course-enrollments')
@Controller('api/v1/enrollments')
export class EnrollmentsController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get('mine')
  @ApiOperation({ summary: 'الدورات التي سجّلت بها' })
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.listMine(user.userId);
  }
}
