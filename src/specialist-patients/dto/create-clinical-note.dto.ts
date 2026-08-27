import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, IsUUID, MinLength } from 'class-validator';
import { SanitizeText } from '../../common/lib/sanitize';

export class CreateClinicalNoteDto {
  @ApiProperty({ description: 'معرّف الحجز (الجلسة) المرتبطة بهذه الملاحظة' })
  @IsUUID()
  bookingId: string;

  @ApiProperty({ example: 'الأم أبدت تحسنًا ملحوظًا في التعامل مع القلق هذا الأسبوع...' })
  @SanitizeText()
  @IsString()
  @MinLength(3, { message: 'نص الملاحظة قصير جدًا' })
  noteText: string;

  @ApiProperty({ description: 'تاريخ الجلسة (ISO)' })
  @IsDateString({}, { message: 'تاريخ الجلسة غير صالح' })
  sessionDate: string;
}
