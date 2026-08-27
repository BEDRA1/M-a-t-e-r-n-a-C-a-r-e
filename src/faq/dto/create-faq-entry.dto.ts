import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { SanitizeText } from '../../common/lib/sanitize';

export class CreateFaqEntryDto {
  @ApiProperty({ description: 'معرّف الفئة' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 'هل الغثيان في الحمل طبيعي؟' })
  @SanitizeText()
  @IsString()
  @MinLength(3, { message: 'السؤال قصير جدًا' })
  questionAr: string;

  @ApiProperty({ example: 'نعم، الغثيان من أكثر أعراض الحمل شيوعًا خاصة في الأشهر الأولى...' })
  @SanitizeText()
  @IsString()
  @MinLength(3, { message: 'الإجابة قصيرة جدًا' })
  answerAr: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'معرّفات أسئلة متابعة مقترحة', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  relatedEntryIds?: string[];
}
