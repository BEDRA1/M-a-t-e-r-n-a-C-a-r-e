import { Module } from '@nestjs/common';
import { DataSharingService } from './data-sharing.service';
import { DataSharingController } from './data-sharing.controller';

@Module({
  controllers: [DataSharingController],
  providers: [DataSharingService],
})
export class DataSharingModule {}
