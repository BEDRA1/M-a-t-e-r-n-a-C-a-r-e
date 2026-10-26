import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min, MinLength, ValidateIf } from 'class-validator';
import { SanitizeText } from '../../common/lib/sanitize';

export class CreateProductDto {
  @ApiProperty()
  @SanitizeText()
  @IsString()
  @MinLength(2, { message: 'اسم المنتج قصير جدًا' })
  @MaxLength(200)
  name: string;

  @ApiProperty()
  @SanitizeText()
  @IsString()
  @MinLength(5, { message: 'وصف المنتج قصير جدًا' })
  @MaxLength(2000)
  description: string;

  @ApiProperty({ example: 'عناية بالأم' })
  @SanitizeText()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  category: string;

  @ApiProperty({ example: 1800 })
  @IsInt({ message: 'السعر يجب أن يكون رقمًا صحيحًا' })
  @Min(0)
  @Max(1000000)
  price: number;

  @ApiProperty({ example: 20 })
  @IsInt({ message: 'المخزون يجب أن يكون رقمًا صحيحًا' })
  @Min(0, { message: 'المخزون لا يكون سالبًا' })
  @Max(100000)
  stockQuantity: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: 'رابط الصورة غير صالح' })
  imageUrl?: string | null;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
