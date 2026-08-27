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

  @ApiProperty({ description: 'قيمة الإجابة على مقياس Likert', minimum: 0, maximum: 3 })
  @IsInt({ message: 'قيمة الإجابة يجب أن تكون رقمًا صحيحًا' })
  @Min(0, { message: 'قيمة الإجابة يجب أن تكون بين 0 و3' })
  @Max(3, { message: 'قيمة الإجابة يجب أن تكون بين 0 و3' })
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
