import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { setupTestDatabase } from './helpers/database';
import { setupTestApp } from './helpers/test-app';
import { PGlite } from '@electric-sql/pglite';

describe('Draft API (e2e)', () => {
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

  it('should delete draft', async () => {
    await db.exec(
      `
      INSERT INTO user_drafts (userName, name, params, updated_at)
      VALUES ('test-user', 'test-draft-2', '{}', now())
    `,
    );

    await request(app.getHttpServer())
      .delete('/api/users/test-user/drafts/test-draft-2')
      .set('X-API-Key', apiKey)
      .expect(204);

    await request(app.getHttpServer())
      .get('/api/users/test-user/drafts/test-draft-2')
      .set('X-API-Key', apiKey)
      .expect(404);
  });

  it('should call delete multiple times with same result', async () => {
    await db.exec(
      `
      INSERT INTO user_drafts (userName, name, params, updated_at)
      VALUES ('test-user', 'test-draft-2', '{}', now())
    `,
    );

    await request(app.getHttpServer())
      .delete('/api/users/test-user/drafts/test-draft-2')
      .set('X-API-Key', apiKey)
      .expect(204);

    await request(app.getHttpServer())
      .delete('/api/users/test-user/drafts/test-draft-2')
      .set('X-API-Key', apiKey)
      .expect(204);

    await request(app.getHttpServer())
      .get('/api/users/test-user/drafts/test-draft-2')
      .set('X-API-Key', apiKey)
      .expect(404);
  });

  it('delete should do nothing if no data', async () => {
    await request(app.getHttpServer())
      .delete('/api/users/test-user/drafts/test-draft-2')
      .set('X-API-Key', apiKey)
      .expect(204);
  });

  it('should handle expired api keys', async () => {
    await db.exec(
      `
      INSERT INTO api_keys (name, key, expires_at, updated_at)
      VALUES ('Test API Key 2', 'api-key-2', '2023-01-01', now());
    `,
    );

    await request(app.getHttpServer())
      .delete('/api/users/test-user/drafts/test-draft-2')
      .set('X-API-Key', 'api-key-2')
      .expect(401);
  });
});
