import { Body, Controller, Get } from '@nestjs/common';
import { RequireApiKey } from '../decorators/require-api-key.decorator';
import { DatabaseService } from '../db.service';

type SettingsDetails = {
  defaultFormat: string;
};

@Controller('api/settings')
@RequireApiKey()
export class SettingsController {
  constructor(private readonly db: DatabaseService) {}

  @Get('')
  public async getDraft(): Promise<SettingsDetails> {
    const res = await this.db.Sql()<Array<{ pdfconfig: string }>>`
    SELECT pdfConfig FROM settings;
    `;

    const [{ pdfconfig }] = res;

    return Promise.resolve({
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      defaultFormat: (JSON.parse(pdfconfig) as any).defaultFormat,
    });
  }
}
