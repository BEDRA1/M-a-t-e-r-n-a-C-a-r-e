import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { SanitizeText } from '../../common/lib/sanitize';

export const BROADCAST_AUDIENCES = ['all', 'pregnant', 'postpartum', 'specialists'] as const;
export type BroadcastAudience = (typeof BROADCAST_AUDIENCES)[number];

export class BroadcastAudienceQueryDto {
  @ApiProperty({ enum: BROADCAST_AUDIENCES })
  @IsIn(BROADCAST_AUDIENCES, { message: 'الفئة المستهدفة غير صالحة' })
  audience: BroadcastAudience;
}

export class SendBroadcastDto extends BroadcastAudienceQueryDto {
  @ApiProperty()
  @SanitizeText()
  @IsString()
  @MinLength(3, { message: 'العنوان قصير جدًا' })
  @MaxLength(100)
  title: string;

  @ApiProperty()
  @SanitizeText()
  @IsString()
  @MinLength(5, { message: 'نص الإشعار قصير جدًا' })
  @MaxLength(1000)
  body: string;
}
