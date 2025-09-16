import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { setupTestDatabase } from './helpers/database';
import { setupTestApp } from './helpers/test-app';
import { PGlite } from '@electric-sql/pglite';

describe('Settings API (e2e)', () => {
  let app: INestApplication;
  let db: PGlite;
  const apiKey = 'test-api-key';
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    // Setup database
    const dbSetup = await setupTestDatabase();
    db = dbSetup.db;

    // Setup application
    const appSetup = await setupTestApp({ db: { ...dbSetup } });
    app = appSetup.app;

    // Combined cleanup
    cleanup = async () => {
      await appSetup.cleanup();
      await dbSetup.cleanup();
    };

    // Insert test API key
    await db.exec(
      `
      INSERT INTO api_keys (name, key, expires_at, updated_at)
      VALUES ('Test API Key', '${apiKey}', '2050-01-01', now());
    `,
    );
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should retrieve settings', async () => {
    await db.exec(
      `
      INSERT INTO settings (pdfConfig, updated_at)
      VALUES ('{"defaultFormat": "A5"}', now());
    `,
    );

    // Get draft
    const response = await request(app.getHttpServer())
      .get('/api/settings')
      .set('X-API-Key', apiKey)
      .expect(200);

    expect(response.body).toMatchObject({
      defaultFormat: 'A5',
    });
  });
});
