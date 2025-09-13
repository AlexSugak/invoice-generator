import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PdfController } from './pdf/pdf.controller';
import { PdfService } from './pdf/pdf.service';
import { DraftController } from './draft/draft.controller';
import { DraftService } from './draft/draft.service';

@Module({
  imports: [],
  controllers: [AppController, PdfController, DraftController],
  providers: [AppService, PdfService, DraftService],
})
export class AppModule {}
