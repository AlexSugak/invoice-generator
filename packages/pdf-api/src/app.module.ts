import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PdfController } from './pdf/pdf.controller';

@Module({
  imports: [],
  controllers: [AppController, PdfController],
  providers: [AppService],
})
export class AppModule {}
