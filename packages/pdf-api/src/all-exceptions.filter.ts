import { ExceptionFilter, Catch, type ArgumentsHost } from '@nestjs/common';
import { SentryExceptionCaptured } from '@sentry/nestjs';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  @SentryExceptionCaptured()
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const status = (exception as any).getStatus
      ? // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        ((exception as any).getStatus() as number)
      : 500;

    response.status(status).json({
      statusCode: status,
      message: exception.message,
    });
  }
}
