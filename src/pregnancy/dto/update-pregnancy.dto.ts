import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { DeliveryType, PregnancyStatus } from '@prisma/client';
import { IsBoolean, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { CreatePregnancyDto } from './create-pregnancy.dto';

export class UpdatePregnancyDto extends PartialType(CreatePregnancyDto) {
  @ApiPropertyOptional({ enum: PregnancyStatus })
  @IsOptional()
  @IsEnum(PregnancyStatus, { message: 'حالة الحمل غير صالحة' })
  status?: PregnancyStatus;

  @ApiPropertyOptional({
    description: 'تاريخ الولادة الفعلي — إلزامي عند تحويل الحالة إلى completed',
    example: '2026-08-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'تاريخ الولادة غير صالح' })
  birthDate?: string;

  // الحقول التالية لها معنى فقط عند تحويل الحالة إلى completed — تُستخدم لملء فترة
  // النفاس (postpartum_period) المُنشأة تلقائيًا في نفس المعاملة، ولا تُطبَّق على الحمل نفسه
  @ApiPropertyOptional({ enum: DeliveryType, description: 'نوع الولادة، عند اكتمال الحمل فقط' })
  @IsOptional()
  @IsEnum(DeliveryType, { message: 'نوع الولادة غير صالح' })
  deliveryType?: DeliveryType;

  @ApiPropertyOptional({ description: 'هل توجد مضاعفات في الولادة؟' })
  @IsOptional()
  @IsBoolean({ message: 'قيمة غير صالحة' })
  hasComplications?: boolean;

  @ApiPropertyOptional({ description: 'هل ترضع طبيعياً؟' })
  @IsOptional()
  @IsBoolean({ message: 'قيمة غير صالحة' })
  isBreastfeeding?: boolean;
}
