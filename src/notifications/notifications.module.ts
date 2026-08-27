import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { AppointmentReminderScheduler } from './appointment-reminder.scheduler';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, AppointmentReminderScheduler],
})
export class NotificationsModule {}
