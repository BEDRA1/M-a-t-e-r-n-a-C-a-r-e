import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { HomeServicesService } from './home-services.service';

@ApiBearerAuth()
@ApiTags('home-services')
@Controller('api/v1/home-services')
export class HomeServicesController {
  constructor(private readonly homeServicesService: HomeServicesService) {}

  @Get()
  @ApiQuery({ name: 'category', required: false })
  @ApiOperation({ summary: 'كتالوج الخدمات المنزلية العام، مع فلترة اختيارية بالفئة' })
  listCatalog(@Query('category') category?: string) {
    return this.homeServicesService.listCatalog(category);
  }
}
