import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getLogger } from '@invoice/common';

const logger = getLogger('pdf-api');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.API_PORT ?? 3000;
  logger.debug('listening on', port);
  await app.listen(port);
}
bootstrap();
