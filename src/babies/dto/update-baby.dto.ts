import { PartialType } from '@nestjs/swagger';
import { CreateBabyDto } from './create-baby.dto';

export class UpdateBabyDto extends PartialType(CreateBabyDto) {}
