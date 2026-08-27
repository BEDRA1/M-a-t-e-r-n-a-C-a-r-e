import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { ProductsController } from './products.controller';
import { ProductOrdersController } from './product-orders.controller';

@Module({
  controllers: [ProductsController, ProductOrdersController],
  providers: [StoreService],
})
export class StoreModule {}
