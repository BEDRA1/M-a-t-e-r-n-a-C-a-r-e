import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BabyGender } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateBabyDto {
  @ApiProperty({ example: 'ياسين' })
  @IsString()
  @MinLength(1, { message: 'اسم الطفل مطلوب' })
  @MaxLength(120)
  fullName: string;

  @ApiProperty({ example: '2026-08-01T00:00:00.000Z' })
  @IsDateString({}, { message: 'تاريخ الميلاد غير صالح' })
  birthDate: string;

  @ApiProperty({ enum: BabyGender })
  @IsEnum(BabyGender, { message: 'جنس الطفل غير صالح' })
  gender: BabyGender;

  @ApiPropertyOptional({ example: 3200, description: 'الوزن عند الولادة بالغرام' })
  @IsOptional()
  @IsInt({ message: 'الوزن يجب أن يكون رقمًا صحيحًا' })
  @Min(200, { message: 'الوزن غير منطقي' })
  @Max(10000, { message: 'الوزن غير منطقي' })
  weightGrams?: number;

  @ApiPropertyOptional({ example: 50, description: 'الطول عند الولادة بالسنتيمتر' })
  @IsOptional()
  @IsNumber({}, { message: 'الطول يجب أن يكون رقمًا' })
  @Min(10, { message: 'الطول غير منطقي' })
  @Max(100, { message: 'الطول غير منطقي' })
  heightCm?: number;
}
