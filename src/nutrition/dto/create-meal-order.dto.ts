import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
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

export class MealOrderItemDto {
  @ApiProperty()
  @IsUUID('4', { message: 'معرّف الوجبة غير صالح' })
  mealId: string;

  @ApiProperty({ example: 2, minimum: 1, maximum: 50 })
  @IsInt({ message: 'الكمية يجب أن تكون رقمًا صحيحًا' })
  @Min(1, { message: 'الكمية يجب أن تكون على الأقل 1' })
  @Max(50, { message: 'الكمية غير منطقية' })
  quantity: number;
}

export class CreateMealOrderDto {
  @ApiProperty({ type: [MealOrderItemDto] })
  @IsArray({ message: 'عناصر الطلب يجب أن تكون قائمة' })
  @ArrayMinSize(1, { message: 'يجب اختيار وجبة واحدة على الأقل' })
  @ValidateNested({ each: true })
  @Type(() => MealOrderItemDto)
  items: MealOrderItemDto[];

  @ApiProperty({ example: 'حي بن عكنون، الجزائر العاصمة' })
  @IsString()
  @MinLength(5, { message: 'عنوان التوصيل قصير جدًا' })
  @MaxLength(300)
  deliveryAddress: string;

  @ApiProperty({ example: '2026-08-15T12:30:00.000Z' })
  @IsDateString({}, { message: 'الوقت المفضل غير صالح' })
  preferredTime: string;

  // موجود فقط حتى لا يرفضه whitelist عند إرساله من عميل لا يثق بالتوثيق — يُتجاهل
  // تمامًا في NutritionService، السعر الحقيقي يُحسب من أسعار الوجبات دائمًا لا من هذا الحقل
  @ApiPropertyOptional({ description: 'يُتجاهل دائمًا — السعر يُحسب من الخادم فقط', deprecated: true })
  @IsOptional()
  @IsNumber()
  totalPrice?: number;
}
