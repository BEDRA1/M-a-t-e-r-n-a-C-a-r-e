import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StoreService } from './store.service';

@ApiBearerAuth()
@ApiTags('products')
@Controller('api/v1/products')
export class ProductsController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'in_stock', required: false, type: Boolean })
  @ApiOperation({ summary: 'كتالوج المنتجات العام، مع فلترة اختيارية بالفئة أو التوفر بالمخزون' })
  listAll(@Query('category') category?: string, @Query('in_stock') inStock?: string) {
    return this.storeService.listProducts({ category, inStockOnly: inStock === 'true' });
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل منتج' })
  findOne(@Param('id') id: string) {
    return this.storeService.findProduct(id);
  }
}
