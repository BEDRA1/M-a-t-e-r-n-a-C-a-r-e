import { Module } from '@nestjs/common';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AdminContentService } from './admin-content.service';
import {
  AdminCoursesController,
  AdminDailyTipsController,
  AdminMealsController,
  AdminPricingController,
  AdminProductsController,
} from './admin-content.controller';

@Module({
  imports: [AuditLogModule],
  controllers: [
    AdminMealsController,
    AdminProductsController,
    AdminDailyTipsController,
    AdminCoursesController,
    AdminPricingController,
  ],
  providers: [AdminContentService],
})
export class AdminContentModule {}
