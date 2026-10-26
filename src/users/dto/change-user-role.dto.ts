import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ChangeUserRoleDto {
  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole, { message: 'الدور غير صالح' })
  role: UserRole;
}
