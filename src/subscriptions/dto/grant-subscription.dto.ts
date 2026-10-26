import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { SanitizeText } from '../../common/lib/sanitize';

export class GrantSubscriptionDto {
  @ApiProperty()
  @IsUUID('4', { message: 'معرّف المستخدم غير صالح' })
  userId: string;

  @ApiProperty({ example: 'premium' })
  @IsString()
  @MinLength(1)
  planCode: string;

  @ApiPropertyOptional({ description: 'مرجع الدفع خارج المنصة (رقم وصل CCP مثلًا)' })
  @SanitizeText()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;
}
