import { Module } from '@nestjs/common';
import { PisteAuditService } from './piste-audit.service';
import { PisteAuditController } from './piste-audit.controller';

@Module({
  controllers: [PisteAuditController],
  providers: [PisteAuditService],
  exports: [PisteAuditService],
})
export class PisteAuditModule {}
