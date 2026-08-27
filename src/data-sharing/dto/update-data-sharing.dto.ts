import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateDataSharingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  shareMoodLogs?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  shareAssessments?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  sharePregnancyData?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  sharePostpartumData?: boolean;
}
