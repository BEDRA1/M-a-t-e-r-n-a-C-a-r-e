import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ProductOrderItemDto {
  @ApiProperty()
  @IsUUID('4', { message: 'معرّف المنتج غير صالح' })
  productId: string;

  @ApiProperty({ example: 2, minimum: 1, maximum: 50 })
  @IsInt({ message: 'الكمية يجب أن تكون رقمًا صحيحًا' })
  @Min(1, { message: 'الكمية يجب أن تكون على الأقل 1' })
  @Max(50, { message: 'الكمية غير منطقية' })
  quantity: number;
}

export class CreateProductOrderDto {
  @ApiProperty({ type: [ProductOrderItemDto] })
  @IsArray({ message: 'عناصر الطلب يجب أن تكون قائمة' })
  @ArrayMinSize(1, { message: 'يجب اختيار منتج واحد على الأقل' })
  @ValidateNested({ each: true })
  @Type(() => ProductOrderItemDto)
  items: ProductOrderItemDto[];

  @ApiProperty({ example: 'حي بن عكنون، الجزائر العاصمة' })
  @IsString()
  @MinLength(5, { message: 'عنوان التوصيل قصير جدًا' })
  @MaxLength(300)
  deliveryAddress: string;

  // موجود فقط حتى لا يرفضه whitelist عند إرساله من عميل لا يثق بالتوثيق — يُتجاهل تمامًا
  // في ProductsService، السعر الحقيقي يُحسب من أسعار المنتجات دائمًا لا من هذا الحقل
  // (نفس نمط CreateMealOrderDto.totalPrice بالحرف)
  @ApiPropertyOptional({ description: 'يُتجاهل دائمًا — السعر يُحسب من الخادم فقط', deprecated: true })
  @IsOptional()
  @IsNumber()
  totalPrice?: number;
}
