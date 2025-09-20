import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
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
  constructor(private readonly draftServie: DraftService) {}

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

    await this.draftServie.saveDraft({
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

    const draftDetails = await this.draftServie.getDraft({
      userName,
      draftName,
    });

    if (!draftDetails) {
      // TODO: tell Sentry that this is a warning, not error
      throw new NotFoundException('draft not found');
    }

    return draftDetails;
  }

  // @Delete('users/:userName/drafts/:draftName')
  // public async delete(
  //   @Res({ passthrough: true }) res: Response,
  //   @Param('draftName') draftName: string,
  //   @Param('userName') userName: string,
  // ): Promise<void> {
  //   logger.debug('getDraft', { draftName, userName });

  //   await this.draftServie.deleteDraft({ userName, draftName });

  //   res.status(204);
  //   return;
  // }

  @Get('users/:userName/drafts/')
  public async getDrafts(
    @Param('userName') userName: string,
  ): Promise<DraftDetails[]> {
    logger.debug('getDraftsList', { userName });

    const drafts = await this.draftServie.getDrafts(userName);

    return drafts;
  }

  @Delete('users/:userName/drafts/:draftName')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Deletes user template draft',
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
  public async deleteDraft(
    @Param('draftName') draftName: string,
    @Param('userName') userName: string,
  ) {
    logger.debug('deleteDraft', { draftName, userName });

    await this.draftServie.deleteDraft({
      userName,
      draftName,
    });
  }
}
