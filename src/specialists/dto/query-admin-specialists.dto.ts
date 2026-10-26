import { ApiPropertyOptional } from '@nestjs/swagger';
import { SpecialistStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class QueryAdminSpecialistsDto {
  @ApiPropertyOptional({ enum: SpecialistStatus })
  @IsOptional()
  @IsEnum(SpecialistStatus, { message: 'حالة الأخصائي غير صالحة' })
  status?: SpecialistStatus;
}
