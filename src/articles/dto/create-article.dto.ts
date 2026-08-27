import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleCategory } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Min,
  MinLength,
} from 'class-validator';
import { SanitizeLimitedHtml, SanitizeText } from '../../common/lib/sanitize';

export class CreateArticleDto {
  @ApiProperty({ example: 'الغثيان الصباحي: كل ما تحتاجين معرفته' })
  @SanitizeText()
  @IsString()
  @MinLength(3, { message: 'العنوان قصير جدًا' })
  titleAr: string;

  @ApiProperty({ example: 'nausea-during-pregnancy', description: 'أحرف لاتينية صغيرة وأرقام وشرطات فقط' })
  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'الرابط (slug) يجب أن يحتوي أحرفًا لاتينية صغيرة وأرقامًا وشرطات فقط',
  })
  slug: string;

  @ApiProperty({ example: 'الغثيان الصباحي من أكثر أعراض الحمل شيوعًا في الأشهر الأولى...' })
  @SanitizeText()
  @IsString()
  @MinLength(10, { message: 'الملخص قصير جدًا' })
  excerptAr: string;

  @ApiProperty({ description: 'محتوى المقال الكامل — وسوم تنسيق بسيطة فقط (p, b, i, ul, li, br)' })
  @SanitizeLimitedHtml()
  @IsString()
  @MinLength(50, { message: 'محتوى المقال قصير جدًا' })
  contentAr: string;

  @ApiProperty({ example: 'https://images.unsplash.com/photo-xxxx' })
  @IsUrl({}, { message: 'رابط صورة الغلاف غير صالح' })
  coverImageUrl: string;

  @ApiProperty({ enum: ArticleCategory })
  @IsEnum(ArticleCategory, { message: 'فئة المقال غير صالحة' })
  category: ArticleCategory;

  @ApiProperty({ example: 'د. أمينة بلحاج' })
  @SanitizeText()
  @IsString()
  @MinLength(2, { message: 'اسم الكاتب قصير جدًا' })
  authorName: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  readTimeMinutes?: number;
}
