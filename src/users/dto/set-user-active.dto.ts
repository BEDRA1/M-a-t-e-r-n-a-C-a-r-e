import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetUserActiveDto {
  @ApiProperty()
  @IsBoolean({ message: 'قيمة التفعيل غير صالحة' })
  isActive: boolean;
}
