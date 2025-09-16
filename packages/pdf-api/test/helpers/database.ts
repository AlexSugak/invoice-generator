import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import path from 'path';
import fs from 'fs';
import { getLogger } from '@invoice/common';

const logger = getLogger('test db');

export async function setupTestDatabase() {
  const port = 5434;
  const host = '127.0.0.1';
  const database = 'invoice_generator';

  const db = await PGlite.create({ database });
  const server = new PGLiteSocketServer({
    db,
    port,
    host,
  });
  await server.start();

  await db.waitReady;

  logger.debug('started pglite db server', { port, host });

  // Read and execute migrations
  const migrationsPath = path.join(__dirname, '../../../db/src/migrations');
  const migrations = fs
    .readdirSync(migrationsPath)
    .filter((f) => !f.includes('.down.'))
    .sort();

  for (const migration of migrations) {
    const sql = fs.readFileSync(path.join(migrationsPath, migration), 'utf8');
    await db.exec(sql);
  }

  logger.debug('finished applying migrations');

  return {
    db,
    port,
    host,
    database,
    cleanup: async () => {
      await server.stop();
      await db.close();
    },
  };
}
