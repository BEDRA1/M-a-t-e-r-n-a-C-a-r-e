import { Module } from '@nestjs/common';
import { ServicePricingService } from './service-pricing.service';
import { ServicePricingController } from './service-pricing.controller';

@Module({
  controllers: [ServicePricingController],
  providers: [ServicePricingService],
  exports: [ServicePricingService],
})
export class ServicePricingModule {}
