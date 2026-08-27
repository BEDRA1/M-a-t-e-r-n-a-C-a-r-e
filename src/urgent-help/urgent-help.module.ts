import { Module } from '@nestjs/common';
import { UrgentHelpService } from './urgent-help.service';
import { UrgentHelpController } from './urgent-help.controller';

@Module({
  controllers: [UrgentHelpController],
  providers: [UrgentHelpService],
})
export class UrgentHelpModule {}
