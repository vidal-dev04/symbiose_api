import { Module } from '@nestjs/common';
import { DocumentsOfficielsService } from './documents-officiels.service';
import { DocumentsOfficielsController } from './documents-officiels.controller';

@Module({
  controllers: [DocumentsOfficielsController],
  providers: [DocumentsOfficielsService],
  exports: [DocumentsOfficielsService],
})
export class DocumentsOfficielsModule {}
