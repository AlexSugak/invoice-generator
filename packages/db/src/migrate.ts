import { Umzug } from 'umzug';
import { Pool } from 'pg';
import * as fs from 'fs';

if (
  !process.env.DB_USER ||
  !process.env.DB_PASSWORD ||
  !process.env.DB_HOST ||
  !process.env.DB_NAME ||
  !Number(process.env.DB_PORT)
) {
  throw new Error('DB_* env vars are missing');
}

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

const migrator = new Umzug({
  migrations: {
    glob: ['migrations/*.sql', { cwd: __dirname, ignore: ['**/*.down.sql'] }],
    resolve: ({ name, path }) => ({
      name,
      up: async () => {
        const sql = await fs.promises.readFile(path!, 'utf8');
        return pool.query(sql);
      },
      down: async () => {
        const downFile = path!.replace('.sql', '.down.sql');
        if (fs.existsSync(downFile)) {
          const sql = await fs.promises.readFile(downFile, 'utf8');
          return pool.query(sql);
        }
      },
    }),
  },
  storage: {
    async logMigration({ name }) {
      await pool.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
    },
    async unlogMigration({ name }) {
      await pool.query('DELETE FROM migrations WHERE name = $1', [name]);
    },
    async executed() {
      const { rows } = await pool.query('SELECT name FROM migrations');
      return rows.map((r) => r.name);
    },
  },
  logger: console,
  context: pool,
});

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
        name VARCHAR(255) PRIMARY KEY,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  await migrator.up();
  await pool.end();
}

main().catch(console.error);
