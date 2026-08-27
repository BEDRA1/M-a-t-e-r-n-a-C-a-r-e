import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class JoinFamilyDto {
  @ApiProperty({ example: 'A1B2C3' })
  @IsString()
  @Length(6, 6, { message: 'كود الدعوة يجب أن يتكون من 6 أحرف' })
  inviteCode: string;
}
