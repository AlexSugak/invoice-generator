import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { getLogger } from '@invoice/common';
import { type NextFunction, type Request } from 'express';
import './instrument';
import { AllExceptionsFilter } from './all-exceptions.filter';

const logger = getLogger('pdf-api');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.API_PORT ?? 3001;

  logger.debug('NODE_ENV', process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'production') {
    logger.debug('enabling CORS');
    app.enableCors({
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Accept', 'X-API-Key', 'Authorization'],
      credentials: true,
    });
  }

  // Log incoming requests for debugging
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.debug(`${req.method} ${req.url}`, {
      origin: req.header('origin') || req.header('Origin'),
    });

    next();
  });
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('PDF API')
    .setDescription('PDF Generation API')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', in: 'header', name: 'X-API-Key' }, 'apiKey')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  logger.debug('listening on', port);
  await app.listen(port);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
