import { getLogger } from '@invoice/common';
import * as Sentry from '@sentry/nestjs';

const logger = getLogger('instrument');

if (!process.env.SENTRY_DSN) {
  logger.warn('missing SENTRY_DSN env var, Sentry will not be configured');
} else {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
  });
}
