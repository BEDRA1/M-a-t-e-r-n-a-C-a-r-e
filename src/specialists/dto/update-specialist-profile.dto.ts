import { PartialType } from '@nestjs/swagger';
import { RegisterSpecialistProfileDto } from './register-specialist-profile.dto';

export class UpdateSpecialistProfileDto extends PartialType(RegisterSpecialistProfileDto) {}
