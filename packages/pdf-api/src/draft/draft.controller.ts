import {
  Body,
  Controller,
  Delete,
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
@Controller('api')
@RequireApiKey()
export class DraftController {
  constructor(private readonly draftServie: DraftService) {}

  @Put('users/:userName/drafts/:draftName')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Saves user template draft or renames existing draft',
  })
  @ApiParam({
    name: 'draftName',
    description: 'Current name of the draft',
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
      'Draft data with optional newName for renaming or params for updating content.',
    required: true,
    schema: {
      type: 'object',
      properties: {
        newName: {
          type: 'string',
          description: 'New name for the draft (optional)',
        },
        params: {
          type: 'object',
          description: 'Draft parameters (optional)',
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
      },
    },
  })
  public async saveDraft(
    @Param('draftName') draftName: string,
    @Param('userName') userName: string,
    @Body() body: { newName?: string; params?: object },
  ) {
    logger.debug('saveDraft', { draftName, userName, body });

    if (body.newName && body.newName !== draftName) {
      // Rename operation
      const success = await this.draftServie.renameDraft({
        userName,
        oldName: draftName,
        newName: body.newName,
      });

      if (!success) {
        throw new NotFoundException('draft not found');
      }
    } else if (body.params) {
      // Update content operation
      await this.draftServie.saveDraft({
        userName,
        draftName,
        params: body.params,
      });
    }
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
      throw new NotFoundException('draft not found');
    }

    return draftDetails;
  }

  @Get('users/:userName/drafts')
  public async getDraftList(
    @Param('userName') userName: string,
  ): Promise<DraftDetails[]> {
    logger.debug('getDraftList', { userName });

    const draftList = await this.draftServie.getDraftList({ userName });

    if (!draftList) {
      throw new NotFoundException('user has no drafts');
    }

    return draftList;
  }

  @Delete('users/:userName/drafts/:draftName')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Deletes a user draft',
  })
  @ApiParam({
    name: 'draftName',
    description: 'Name of the draft to delete',
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

    const success = await this.draftServie.deleteDraft({
      userName,
      draftName,
    });

    if (!success) {
      throw new NotFoundException('draft not found');
    }
  }
}
