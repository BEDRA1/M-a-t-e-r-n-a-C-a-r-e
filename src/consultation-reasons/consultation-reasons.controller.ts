import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConsultationReasonsService } from './consultation-reasons.service';

@ApiBearerAuth()
@ApiTags('consultation-reasons')
@Controller('api/v1/consultation-reasons')
export class ConsultationReasonsController {
  constructor(private readonly reasonsService: ConsultationReasonsService) {}

  @Get()
  @ApiOperation({ summary: 'قائمة أسباب الحجز المتاحة' })
  listActive() {
    return this.reasonsService.listActive();
  }
}
