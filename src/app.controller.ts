import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('health')
@Controller('api/v1/health')
export class AppController {
  @Public()
  @Get()
  check() {
    return { status: 'ok', service: 'materna-care-api' };
  }
}
