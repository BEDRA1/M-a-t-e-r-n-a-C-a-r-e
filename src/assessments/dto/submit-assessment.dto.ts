import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class AssessmentAnswerDto {
  @ApiProperty({ description: 'معرّف السؤال' })
  @IsUUID()
  questionId: string;

  // الحد الأقصى 4 لا 3: أغلب المقاييس (GAD-7/EPDS) بها 4 خيارات (0-3)، لكن مقياس الصدمة
  // التالية للولادة بها 5 خيارات (0-4) — التحقق الدقيق من انتماء القيمة لعدد خيارات
  // البند الفعلي يحدث في AssessmentsService.submit، هذا فقط حد أقصى عام آمن على مستوى الـDTO
  @ApiProperty({ description: 'قيمة الإجابة على مقياس Likert', minimum: 0, maximum: 4 })
  @IsInt({ message: 'قيمة الإجابة يجب أن تكون رقمًا صحيحًا' })
  @Min(0, { message: 'قيمة الإجابة يجب أن تكون بين 0 و4' })
  @Max(4, { message: 'قيمة الإجابة يجب أن تكون بين 0 و4' })
  value: number;
}

export class SubmitAssessmentDto {
  @ApiProperty({ description: 'معرّف المحور النفسي' })
  @IsUUID()
  domainId: string;

  @ApiProperty({ type: [AssessmentAnswerDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'يجب الإجابة على سؤال واحد على الأقل' })
  @ValidateNested({ each: true })
  @Type(() => AssessmentAnswerDto)
  answers: AssessmentAnswerDto[];
}
