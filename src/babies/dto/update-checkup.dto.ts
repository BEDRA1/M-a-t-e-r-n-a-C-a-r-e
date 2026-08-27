import { PartialType } from '@nestjs/swagger';
import { CreateCheckupDto } from './create-checkup.dto';

export class UpdateCheckupDto extends PartialType(CreateCheckupDto) {}
