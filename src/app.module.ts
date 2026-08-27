import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FamiliesModule } from './families/families.module';
import { PregnancyModule } from './pregnancy/pregnancy.module';
import { RemindersModule } from './reminders/reminders.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { DailyTipsModule } from './daily-tips/daily-tips.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SpecialistsModule } from './specialists/specialists.module';
import { SpecialistAvailabilityModule } from './specialist-availability/specialist-availability.module';
import { ConsultationReasonsModule } from './consultation-reasons/consultation-reasons.module';
import { BookingsModule } from './bookings/bookings.module';
import { BookingReviewsModule } from './booking-reviews/booking-reviews.module';
import { PaymentsModule } from './payments/payments.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PostpartumModule } from './postpartum/postpartum.module';
import { BabiesModule } from './babies/babies.module';
import { CoursesModule } from './courses/courses.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { HomeServicesModule } from './home-services/home-services.module';
import { StoreModule } from './store/store.module';
import { ServicePricingModule } from './service-pricing/service-pricing.module';
import { UrgentHelpModule } from './urgent-help/urgent-help.module';
import { MoodModule } from './mood/mood.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { FaqModule } from './faq/faq.module';
import { ArticlesModule } from './articles/articles.module';
import { DataSharingModule } from './data-sharing/data-sharing.module';
import { SpecialistPatientsModule } from './specialist-patients/specialist-patients.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { AuditLogInterceptor } from './audit-log/interceptors/audit-log.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    // الحد الافتراضي لباقي الـAPI (100 طلب/دقيقة/IP) — مسارات حساسة محددة (تسجيل الدخول،
    // التسجيل، الاشتراك) تُعيد ضبط حدّها الخاص عبر @Throttle() في متحكماتها مباشرة
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    FamiliesModule,
    PregnancyModule,
    RemindersModule,
    AssessmentsModule,
    DailyTipsModule,
    NotificationsModule,
    SpecialistsModule,
    SpecialistAvailabilityModule,
    ConsultationReasonsModule,
    BookingsModule,
    BookingReviewsModule,
    PaymentsModule,
    SubscriptionsModule,
    PostpartumModule,
    BabiesModule,
    CoursesModule,
    NutritionModule,
    HomeServicesModule,
    StoreModule,
    ServicePricingModule,
    UrgentHelpModule,
    MoodModule,
    TestimonialsModule,
    FaqModule,
    ArticlesModule,
    DataSharingModule,
    SpecialistPatientsModule,
    AuditLogModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
  ],
})
export class AppModule {}
