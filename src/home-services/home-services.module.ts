import { Module } from '@nestjs/common';
import { HomeServicesService } from './home-services.service';
import { HomeServicesController } from './home-services.controller';
import { ServiceBookingsController } from './service-bookings.controller';

@Module({
  controllers: [HomeServicesController, ServiceBookingsController],
  providers: [HomeServicesService],
})
export class HomeServicesModule {}
