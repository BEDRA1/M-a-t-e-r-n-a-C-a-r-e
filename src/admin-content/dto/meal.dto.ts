import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { MealType } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min, MinLength, ValidateIf } from 'class-validator';
import { SanitizeText } from '../../common/lib/sanitize';

export class CreateMealDto {
  @ApiProperty({ minimum: 0, maximum: 6, description: '0 = الأحد (ترميز Date.getDay())' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ enum: MealType })
  @IsEnum(MealType, { message: 'نوع الوجبة غير صالح' })
  mealType: MealType;

  @ApiProperty()
  @SanitizeText()
  @IsString()
  @MinLength(2, { message: 'اسم الوجبة قصير جدًا' })
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'المكونات / الوصف' })
  @SanitizeText()
  @IsString()
  @MinLength(5, { message: 'المكونات قصيرة جدًا' })
  @MaxLength(1000)
  description: string;

  @ApiProperty({ example: 650 })
  @IsInt({ message: 'السعر يجب أن يكون رقمًا صحيحًا' })
  @Min(0)
  @Max(100000)
  price: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: 'رابط الصورة غير صالح' })
  imageUrl?: string | null;
}

export class UpdateMealDto extends PartialType(CreateMealDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
