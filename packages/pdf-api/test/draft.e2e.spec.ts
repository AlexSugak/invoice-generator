import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { setupTestDatabase } from './helpers/database';
import { setupTestApp } from './helpers/test-app';
import { PGlite } from '@electric-sql/pglite';

describe('DraftController (e2e)', () => {
  let app: INestApplication;
  let db: PGlite;
  const apiKey = 'test-api-key';
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
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
    await db.query(
      `
      INSERT INTO api_keys (name, key, expires_at, updated_at)
      VALUES ('Test API Key', $1, '2050-01-01', now())
    `,
      [apiKey],
    );
  });

  afterAll(async () => {
    await cleanup();
  });

  it('should save and retrieve draft', async () => {
    const testDraft = {
      invoiceNumber: '123',
      date: '2025-09-10',
      from: { name: 'Test Inc.' },
    };

    // Save draft
    await request(app.getHttpServer())
      .put('/api/users/testuser/drafts/test-draft')
      .set('X-API-Key', apiKey)
      .send(testDraft)
      .expect(200);

    // Get draft
    const response = await request(app.getHttpServer())
      .get('/api/users/testuser/drafts/test-draft')
      .set('X-API-Key', apiKey)
      .expect(200);

    expect(response.body).toMatchObject({
      userName: 'testuser',
      name: 'test-draft',
      params: testDraft,
    });
  });

  it('should return 404 for non-existent draft', async () => {
    await request(app.getHttpServer())
      .get('/api/users/testuser/drafts/non-existent')
      .set('X-API-Key', apiKey)
      .expect(404);
  });

  it('should require valid API key', async () => {
    await request(app.getHttpServer())
      .get('/api/users/testuser/drafts/test-draft')
      .set('X-API-Key', 'invalid-key')
      .expect(401);
  });
});
