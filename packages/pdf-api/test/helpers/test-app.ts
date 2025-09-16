import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

export async function setupTestApp({
  db: { port, host, database },
}: {
  db: { database: string; port: number; host: string };
}) {
  process.env.DB_USER = '';
  process.env.DB_PASSWORD = '';
  process.env.DB_HOST = host;
  process.env.DB_NAME = database;
  process.env.DB_PORT = port.toString();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  return {
    app,
    cleanup: async () => {
      await app.close();
    },
  };
}
