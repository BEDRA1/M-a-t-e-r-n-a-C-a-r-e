import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class SetVideoLinkDto {
  @ApiProperty({ example: 'https://meet.google.com/abc-defg-hij' })
  @IsUrl({}, { message: 'رابط الفيديو غير صالح' })
  videoLink: string;
}
