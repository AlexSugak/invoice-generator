import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { RequireApiKey } from '../decorators/require-api-key.decorator';
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';
import { getLogger } from '@invoice/common';
import { DraftDetails, DraftService } from './draft.service';
import { type Response } from 'express';

const logger = getLogger('DraftController');
@Controller('api/')
@RequireApiKey()
export class DraftController {
  constructor(private readonly draftService: DraftService) { }

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
    logger.debug('Save Draft :: ', { draftName, userName });

    await this.draftService.saveDraft({
      userName,
      draftName,
      params: draftParams,
    });
  }

  @Post('users/:userName/drafts/:draftName')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Create user template draft',
  })
  @ApiParam({
    name: 'userName',
    description: 'Name of the user',
    required: true,
    schema: { type: 'string' },
  })
  @ApiParam({
    name: 'draftName',
    description: 'Name of the draft',
    required: true,
    schema: { type: 'string' },
  })
  @ApiBody({
    description: 'Invoice draft parameters',
    required: true,
    schema: {
      type: 'object',
      additionalProperties: true,
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
  public async createDraft(
    @Param('userName') userName: string,
    @Param('draftName') draftName: string,
    @Body() draftParams: object,
  ) {
    logger.debug('Create Draft :: ', { userName, draftName, draftParams });
    await this.draftService.createDraft({
      userName,
      draftName,
      params: draftParams,
    });
  }

  @Get('users/:userName/drafts/:draftName')
  @ApiOperation({
    summary: 'Gets template draft details',
  })
  public async getDraft(
    @Param('draftName') draftName: string,
    @Param('userName') userName: string,
  ): Promise<DraftDetails> {
    logger.debug('Get Draft :: ', { draftName, userName });

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
  @ApiOperation({
    summary: 'Gets list of drafts',
  })
  public async getDrafts(
    @Param('userName') userName: string,
  ): Promise<DraftDetails[]> {
    logger.debug('Get all Drafts :: ', { userName });

    const drafts = await this.draftService.getDrafts({
      userName,
    });

    if (!drafts) {
      throw new NotFoundException('drafts not found');
    }

    return drafts;
  }

  @Delete('users/:userName/drafts/:draftName')
  public async delete(
    @Res({ passthrough: true }) res: Response,
    @Param('draftName') draftName: string,
    @Param('userName') userName: string,
  ): Promise<void> {
    logger.debug('Delete Draft :: ', { draftName, userName });

    await this.draftService.deleteDraft({ userName, draftName });

    res.status(204);
    return;
  }
}
