import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServicePricingService } from './service-pricing.service';

@ApiBearerAuth()
@ApiTags('service-pricing')
@Controller('api/v1/service-pricing')
export class ServicePricingController {
  constructor(private readonly servicePricingService: ServicePricingService) {}

  @Get()
  @ApiOperation({ summary: 'الأسعار الثابتة لكل نوع خدمة (استشارة/دورة) × نوع اللقاء (حضوري/عن بُعد)' })
  listAll() {
    return this.servicePricingService.listAll();
  }
}
