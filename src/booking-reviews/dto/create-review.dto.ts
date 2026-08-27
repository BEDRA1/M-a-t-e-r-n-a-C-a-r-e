import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { SanitizeText } from '../../common/lib/sanitize';

export class CreateReviewDto {
  @ApiProperty({ description: 'معرّف الحجز المكتمل' })
  @IsUUID()
  bookingId: string;

  @ApiProperty({ minimum: 1, maximum: 5, example: 5 })
  @IsInt({ message: 'التقييم يجب أن يكون رقمًا صحيحًا' })
  @Min(1, { message: 'التقييم يجب أن يكون بين 1 و5' })
  @Max(5, { message: 'التقييم يجب أن يكون بين 1 و5' })
  rating: number;

  @ApiPropertyOptional({ example: 'كانت الجلسة مفيدة جدًا، شكرًا' })
  @SanitizeText()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
