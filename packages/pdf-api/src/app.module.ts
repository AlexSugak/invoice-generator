import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PdfController } from './pdf/pdf.controller';
import { PdfService } from './pdf/pdf.service';
import { DraftController } from './draft/draft.controller';
import { DraftService } from './draft/draft.service';
import { DatabaseService } from './db.service';
import { SettingsController } from './settings/settings.controller';
import { SentryModule } from '@sentry/nestjs/setup';

@Module({
  imports: [SentryModule.forRoot()],
  controllers: [
    AppController,
    PdfController,
    DraftController,
    SettingsController,
  ],
  providers: [AppService, PdfService, DraftService, DatabaseService],
})
export class AppModule {}
