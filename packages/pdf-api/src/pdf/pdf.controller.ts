import { Body, Controller, HttpCode, Param, Post, Res } from '@nestjs/common';
import { RequireApiKey } from '../decorators/require-api-key.decorator';
import { PdfService } from './pdf.service';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';
import { getLogger } from '@invoice/common';

const logger = getLogger('PdfController');
@Controller('api/pdf')
@RequireApiKey()
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('generate/:templateName')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Generates PDF using template',
    description:
      'Uses specified template and provided params to generate a PDF file',
  })
  @ApiParam({
    name: 'templateName',
    description: 'Name of the template to use',
    required: true,
    schema: { type: 'string' },
  })
  @ApiBody({
    description:
      'Arbitrary JSON parameters passed to the template engine. This can be any JSON object.',
    required: true,
    schema: {
      type: 'object',
      additionalProperties: true, // allow any shape
      example: {
        invoiceNumber: '123',
        date: '2025-09-10',
        from: { name: 'Acme Inc.' },
        billTo: { name: 'Client LLC' },
        items: [{ description: 'Design work', quantity: 10, rate: 50 }],
        taxPercent: 19,
        currency: 'USD',
      },
    },
  })
  @ApiOkResponse({
    description: 'PDF file',
    content: {
      'application/pdf': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  public async generatePdf(
    @Param('templateName') templateName: string,
    @Body() templateParams: object,
    @Res() res: Response,
  ) {
    logger.debug('generatePdf', { templateName });
    const pdf = await this.pdfService.generatePdf(templateName, templateParams);

    const fileName = `${templateName}-${new Date().toISOString().slice(0, 10)}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', String(pdf.length));
    res.setHeader('Cache-Control', 'no-store');

    logger.debug('generatePdf success', { fileName, size: pdf.length });
    return res.send(pdf);
  }
}
