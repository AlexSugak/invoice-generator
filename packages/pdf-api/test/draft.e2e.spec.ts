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

    await request(app.getHttpServer())
      .put('/api/users/testuser/drafts/test-draft')
      .set('X-API-Key', apiKey)
      .send(testDraft)
      .expect(200);

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

  it('should return a list of drafts for a user', async () => {
    const draft1 = {
      invoiceNumber: '111',
      date: '2025-09-11',
      from: { name: 'Company A' },
    };
    const draft2 = {
      invoiceNumber: '222',
      date: '2025-09-12',
      from: { name: 'Company B' },
    };

    await request(app.getHttpServer())
      .put('/api/users/testuser/drafts/draft-1')
      .set('X-API-Key', apiKey)
      .send(draft1)
      .expect(200);

    await request(app.getHttpServer())
      .put('/api/users/testuser/drafts/draft-2')
      .set('X-API-Key', apiKey)
      .send(draft2)
      .expect(200);

    const response = await request(app.getHttpServer())
      .get('/api/users/testuser/drafts')
      .set('X-API-Key', apiKey)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'draft-1',
          userName: 'testuser',
          params: draft1,
        }),
        expect.objectContaining({
          name: 'draft-2',
          userName: 'testuser',
          params: draft2,
        }),
      ]),
    );
  });

  it('should return an empty list if user has no drafts', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/users/emptyuser/drafts')
      .set('X-API-Key', apiKey)
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('should not leak drafts from other users', async () => {
    const otherDraft = {
      invoiceNumber: '999',
      date: '2025-09-13',
      from: { name: 'Other Corp' },
    };

    await request(app.getHttpServer())
      .put('/api/users/otheruser/drafts/other-draft')
      .set('X-API-Key', apiKey)
      .send(otherDraft)
      .expect(200);

    const response = await request(app.getHttpServer())
      .get('/api/users/testuser/drafts')
      .set('X-API-Key', apiKey)
      .expect(200);

    expect(response.body).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'other-draft', userName: 'otheruser' }),
      ]),
    );
  });

  it('should require valid API key for list endpoint', async () => {
    await request(app.getHttpServer())
      .get('/api/users/testuser/drafts')
      .set('X-API-Key', 'invalid-key')
      .expect(401);
  });

  it('should overwrite an existing draft when saving with the same name', async () => {
    const original = {
      invoiceNumber: 'AAA',
      date: '2025-09-14',
      from: { name: 'Old Co.' },
    };
    const updated = {
      invoiceNumber: 'BBB',
      date: '2025-09-15',
      from: { name: 'New Co.' },
    };

    await request(app.getHttpServer())
      .put('/api/users/testuser/drafts/my-draft')
      .set('X-API-Key', apiKey)
      .send(original)
      .expect(200);

    await request(app.getHttpServer())
      .put('/api/users/testuser/drafts/my-draft')
      .set('X-API-Key', apiKey)
      .send(updated)
      .expect(200);

    const response = await request(app.getHttpServer())
      .get('/api/users/testuser/drafts/my-draft')
      .set('X-API-Key', apiKey)
      .expect(200);

    const body = response.body as { params: { items: any[] } };

    expect(body.params).toEqual(updated);
  });

  it('should handle draft names with dashes and underscores', async () => {
    const draft = {
      invoiceNumber: '321',
      date: '2025-09-16',
      from: { name: 'Special Draft Inc.' },
    };

    await request(app.getHttpServer())
      .put('/api/users/testuser/drafts/special-draft_123')
      .set('X-API-Key', apiKey)
      .send(draft)
      .expect(200);

    const response = await request(app.getHttpServer())
      .get('/api/users/testuser/drafts/special-draft_123')
      .set('X-API-Key', apiKey)
      .expect(200);

    const body = response.body as { params: { items: any[] } };

    expect(body.params).toEqual(draft);
  });

  it('should save and retrieve a large draft payload', async () => {
    const draft = {
      invoiceNumber: '999',
      date: '2025-09-17',
      from: { name: 'Big Corp' },
      items: Array.from({ length: 100 }, (_, i) => ({
        description: `Item ${i}`,
        price: i,
      })),
    };

    await request(app.getHttpServer())
      .put('/api/users/testuser/drafts/large-draft')
      .set('X-API-Key', apiKey)
      .send(draft)
      .expect(200);

    const response = await request(app.getHttpServer())
      .get('/api/users/testuser/drafts/large-draft')
      .set('X-API-Key', apiKey)
      .expect(200);

    const body = response.body as { params: { items: any[] } };

    expect(body.params.items).toHaveLength(100);
  });
});
