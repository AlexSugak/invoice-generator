import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';
import { RequireApiKey } from '../decorators/require-api-key.decorator';
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';
import { BasicInvoiceInfo, getLogger } from '@invoice/common';
import { DraftDetails, DraftService } from './draft.service';

const logger = getLogger('DraftController');
@Controller('api')
@RequireApiKey()
export class DraftController {
  constructor(private readonly draftService: DraftService) {}

  @Put('users/:userName/drafts/create')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Creates user template draft',
  })
  @ApiParam({
    name: 'userName',
    description: 'Name of the user',
    required: true,
    schema: { type: 'string' },
  })
  @ApiBody({
    description:
      'Arbitrary JSON draft parameters. This can be any JSON object.',
    required: true,
    schema: {
      type: 'object',
      additionalProperties: true, // allow any shape
      example: {
        draftName: 'Draft 123',
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
  public async createDraft(
    @Param('draftName') draftName: string,
    @Param('userName') userName: string,
    @Body() invoiceData: BasicInvoiceInfo,
  ) {
    logger.debug('createDraft', { draftName, userName });
    await this.draftService.createDraft({
      userName,
      invoiceData,
    });
  }

  @Put('users/:userName/drafts/:draftId')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Edits user template draft',
  })
  @ApiParam({
    name: 'draftId',
    description: 'Id of the draft',
    required: true,
    schema: { type: 'string' },
  })
  @ApiParam({
    name: 'userName',
    description: 'Name of the user',
    required: true,
    schema: { type: 'string' },
  })
  @ApiBody({
    description:
      'Arbitrary JSON draft parameters. This can be any JSON object.',
    required: true,
    schema: {
      type: 'object',
      additionalProperties: true, // allow any shape
      example: {
        draftName: 'Draft 123',
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
  public async editDraft(
    @Param('draftId') draftId: number,
    @Param('userName') userName: string,
    @Body() invoiceData: BasicInvoiceInfo,
  ) {
    logger.debug('edit', { draftId, userName });
    await this.draftService.editDraft({
      userName,
      draftId,
      invoiceData,
    });
  }

  @Get('users/:userName/drafts')
  public async getDrafts(@Param('userName') userName: string) {
    logger.debug('getDrafts', userName);

    const drafts = await this.draftService.getDrafts(userName);

    return drafts;
  }

  @Get('users/:userName/drafts/:draftId')
  public async getDraft(
    @Param('draftId') draftId: number,
    @Param('userName') userName: string,
  ): Promise<DraftDetails> {
    logger.debug('getDraft', { draftId, userName });

    const draftDetails = await this.draftService.getDraft({
      userName,
      draftId,
    });

    if (!draftDetails) {
      throw new NotFoundException('draft not found');
    }

    return draftDetails;
  }
}
