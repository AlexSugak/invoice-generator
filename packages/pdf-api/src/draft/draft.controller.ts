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
import { getLogger } from '@invoice/common';
import { DraftDetails, DraftService } from './draft.service';

const logger = getLogger('DraftController');
@Controller('api/')
@RequireApiKey()
export class DraftController {
  constructor(private readonly draftService: DraftService) {}

  @Put('users/:userName/drafts/:draftName')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Saves user template draft',
  })
  @ApiParam({
    name: 'draftName',
    description: 'Name of the draft',
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
  public async saveDraft(
    @Param('draftName') draftName: string,
    @Param('userName') userName: string,
    @Body() draftParams: object,
  ) {
    logger.debug('saveDraft', { draftName, userName });
    await this.draftService.saveDraft({
      userName,
      draftName,
      params: draftParams,
    });
  }

  @Get('users/:userName/drafts/:draftName')
  public async getDraft(
    @Param('draftName') draftName: string,
    @Param('userName') userName: string,
  ): Promise<DraftDetails> {
    logger.debug('getDraft', { draftName, userName });

    const draftDetails = await this.draftService.getDraft({
      userName,
      draftName,
    });

    if (!draftDetails) {
      throw new NotFoundException('draft not found');
    }

    return draftDetails;
  }

  @Get('users/:userName/drafts')
  public async getUserDrafts(
    @Param('userName') userName: string,
  ): Promise<DraftDetails[]> {
    logger.debug('getUserDrafts', { userName });

    const drafts = await this.draftService.getUserDrafts({
      userName,
    });

    if (!drafts) {
      throw new NotFoundException('drafts not found');
    }

    return drafts;
  }
}
