import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PregnancyCalcMethod } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreatePregnancyDto {
  @ApiProperty({ enum: PregnancyCalcMethod })
  @IsEnum(PregnancyCalcMethod, { message: 'طريقة الحساب غير صالحة' })
  calcMethod: PregnancyCalcMethod;

  @ApiPropertyOptional({ description: 'تاريخ آخر دورة شهرية، مطلوب إذا كانت طريقة الحساب lmp' })
  @ValidateIf((o: CreatePregnancyDto) => o.calcMethod === PregnancyCalcMethod.lmp)
  @IsDateString({}, { message: 'تاريخ آخر دورة شهرية غير صالح' })
  lmpDate?: string;

  @ApiPropertyOptional({ description: 'تاريخ الإباضة/الإخصاب، مطلوب إذا كانت طريقة الحساب ovulation' })
  @ValidateIf((o: CreatePregnancyDto) => o.calcMethod === PregnancyCalcMethod.ovulation)
  @IsDateString({}, { message: 'تاريخ الإباضة غير صالح' })
  conceptionDate?: string;

  @ApiPropertyOptional({ description: 'تاريخ فحص السونار، مطلوب إذا كانت طريقة الحساب ultrasound' })
  @ValidateIf((o: CreatePregnancyDto) => o.calcMethod === PregnancyCalcMethod.ultrasound)
  @IsDateString({}, { message: 'تاريخ السونار غير صالح' })
  ultrasoundDate?: string;

  @ApiPropertyOptional({ description: 'عمر الحمل بالأسابيع وقت السونار', example: 12 })
  @ValidateIf((o: CreatePregnancyDto) => o.calcMethod === PregnancyCalcMethod.ultrasound)
  @IsInt({ message: 'عدد أسابيع السونار يجب أن يكون رقمًا صحيحًا' })
  @Min(1, { message: 'عدد أسابيع السونار غير منطقي' })
  @Max(42, { message: 'عدد أسابيع السونار غير منطقي' })
  ultrasoundWeeks?: number;

  @ApiPropertyOptional({ description: 'هل هذا حملها الأول؟' })
  @IsOptional()
  @IsBoolean({ message: 'قيمة غير صالحة' })
  isFirstPregnancy?: boolean;

  @ApiPropertyOptional({ description: 'عدد الأحمال السابقة، له معنى فقط إذا لم يكن الحمل الأول', example: 1 })
  @IsOptional()
  @IsInt({ message: 'عدد الأحمال السابقة يجب أن يكون رقمًا صحيحًا' })
  @Min(0, { message: 'عدد الأحمال السابقة غير منطقي' })
  @Max(20, { message: 'عدد الأحمال السابقة غير منطقي' })
  previousPregnanciesCount?: number;

  @ApiPropertyOptional({ description: 'هل تعاني من مرض أو حالة صحية؟' })
  @IsOptional()
  @IsBoolean({ message: 'قيمة غير صالحة' })
  hasHealthCondition?: boolean;

  @ApiPropertyOptional({ description: 'وصف المرض/الحالة الصحية، له معنى فقط إذا كانت hasHealthCondition صحيحة' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'الوصف طويل جدًا' })
  healthConditionNote?: string;
}
