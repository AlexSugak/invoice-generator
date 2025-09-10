import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function RequireApiKey() {
  return applyDecorators(
    UseGuards(ApiKeyGuard),
    ApiBearerAuth('apiKey'),
    ApiUnauthorizedResponse(),
  );
}
