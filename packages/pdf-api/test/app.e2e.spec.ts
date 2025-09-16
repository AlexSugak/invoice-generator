import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { setupTestDatabase } from './helpers/database';
import { setupTestApp } from './helpers/test-app';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    // Setup database
    const dbSetup = await setupTestDatabase();

    // Setup application
    const appSetup = await setupTestApp({ db: { ...dbSetup } });
    app = appSetup.app;

    // Combined cleanup
    cleanup = async () => {
      await appSetup.cleanup();
      await dbSetup.cleanup();
    };
  });

  afterAll(async () => {
    await cleanup();
  });

  it('/ (GET)', async () => {
    return await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
