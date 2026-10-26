import { Module } from '@nestjs/common';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AdminExportsController } from './admin-exports.controller';
import { AdminExportsService } from './admin-exports.service';

@Module({
  imports: [AuditLogModule],
  controllers: [AdminExportsController],
  providers: [AdminExportsService],
})
export class AdminExportsModule {}
