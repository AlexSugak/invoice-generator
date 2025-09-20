import { browserTracingIntegration, init, replayIntegration } from '@sentry/nextjs';

console.info('[Sentry] init(client) starting');

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
  tracesSampleRate: 0.2,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.0,
  integrations: [
    replayIntegration({ maskAllText: false, blockAllMedia: false }),
    browserTracingIntegration(),
  ],
});

console.info('[Sentry] init(client) done');
