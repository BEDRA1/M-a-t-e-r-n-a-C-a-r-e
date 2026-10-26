import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class UpdatePriceDto {
  @ApiProperty({ example: 2000, description: 'بالدينار الجزائري' })
  @IsInt({ message: 'السعر يجب أن يكون رقمًا صحيحًا' })
  @Min(0, { message: 'السعر لا يكون سالبًا' })
  @Max(1000000)
  price: number;
}
