import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '@prisma/client';

// admin لا يُنشأ عبر التسجيل العام، فقط عبر seed أو من طرف admin آخر لاحقاً.
// specialist يمكنه التسجيل هنا مباشرة، لكن حسابه لا يظهر للحجز إلا بعد إنشاء
// ملفه المهني (specialists module) وموافقة admin عليه (status=approved).
const REGISTERABLE_ROLES = [UserRole.mother, UserRole.spouse, UserRole.specialist] as const;
export type RegisterableRole = (typeof REGISTERABLE_ROLES)[number];

export class RegisterDto {
  @ApiProperty({ example: '0555123456', description: 'رقم الهاتف' })
  @IsString()
  @IsNotEmpty({ message: 'رقم الهاتف مطلوب' })
  phone: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  email?: string;

  @ApiProperty({ example: 'StrongP@ss1', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  password: string;

  @ApiProperty({ enum: REGISTERABLE_ROLES, example: UserRole.mother })
  @IsIn(REGISTERABLE_ROLES, { message: 'الدور غير صالح' })
  role: RegisterableRole;

  @ApiPropertyOptional({ example: 'الجزائر العاصمة' })
  @IsOptional()
  @IsString()
  wilaya?: string;

  @ApiPropertyOptional({ example: '1995-04-12', description: 'تاريخ الميلاد' })
  @IsOptional()
  @IsDateString({}, { message: 'تاريخ الميلاد غير صالح' })
  dateOfBirth?: string;
}
