import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { EnrollmentsController } from './enrollments.controller';

@Module({
  controllers: [CoursesController, EnrollmentsController],
  providers: [CoursesService],
})
export class CoursesModule {}
