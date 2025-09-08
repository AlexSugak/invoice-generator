import { Controller, Get } from '@nestjs/common';
import { RequireApiKey } from '../decorators/require-api-key.decorator';

@Controller('pdf')
@RequireApiKey() // Protect all routes in controller
export class PdfController {
  @Get('generate')
  // Or protect individual routes with @RequireApiKey()
  async generatePdf() {
    // Your implementation
  }
}
