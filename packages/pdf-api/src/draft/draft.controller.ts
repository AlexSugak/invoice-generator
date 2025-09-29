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
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
} from '@nestjs/swagger';
import { getLogger } from '@invoice/common';
import { DraftService } from './draft.service';
import { type Response } from 'express';

export class DraftDetailsDto {
  @ApiProperty({
    example: 'john',
    description: 'Name of the user',
  })
  userName!: string;

  @ApiProperty({
    example: 'invoice-draft-1',
    description: 'Name of the draft',
  })
  name!: string;

  @ApiProperty({
    description: 'Arbitrary JSON draft parameters',
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
  })
  params!: Record<string, any>;
}

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
  @ApiOperation({ summary: 'Get a single draft for a user' })
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
  @ApiOkResponse({
    description: 'Draft details returned successfully',
    type: DraftDetailsDto,
  })
  @ApiNotFoundResponse({ description: 'Draft not found' })
  public async getDraft(
    @Param('draftName') draftName: string,
    @Param('userName') userName: string,
  ): Promise<DraftDetailsDto> {
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

  @Delete('users/:userName/drafts/:draftName')
  public async delete(
    @Res({ passthrough: true }) res: Response,
    @Param('draftName') draftName: string,
    @Param('userName') userName: string,
  ): Promise<void> {
    logger.debug('getDraft', { draftName, userName });

    await this.draftService.deleteDraft({ userName, draftName });

    res.status(204);
    return;
  }
  @Get('users/:userName/drafts')
  @ApiOperation({ summary: 'Get all drafts for a user' })
  @ApiParam({
    name: 'userName',
    description: 'Name of the user',
    required: true,
    schema: { type: 'string' },
  })
  @ApiOkResponse({
    description: 'List of user drafts',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Drafts not found' })
  public async getAllDrafts(
    @Param('userName') userName: string,
  ): Promise<Array<{ name: string }>> {
    logger.debug('getAllDrafts', { userName });

    const draftList = await this.draftService.getAllDrafts({
      userName,
    });

    if (!draftList) {
      throw new NotFoundException('drafts not found');
    }

    return draftList;
  }
}
