import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { AppointmentReminderScheduler } from './appointment-reminder.scheduler';
import { VaccinationReminderScheduler } from './vaccination-reminder.scheduler';
import { DailyWellnessTipScheduler } from './daily-wellness-tip.scheduler';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    AppointmentReminderScheduler,
    VaccinationReminderScheduler,
    DailyWellnessTipScheduler,
  ],
})
export class NotificationsModule {}
