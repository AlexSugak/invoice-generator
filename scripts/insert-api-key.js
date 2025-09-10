const postgres = require('postgres');

if (!process.env.API_KEY) {
  console.error('API_KEY env var is required');
  process.exit(1);
}

if (
  !process.env.DB_USER ||
  !process.env.DB_PASSWORD ||
  !process.env.DB_HOST ||
  !process.env.DB_NAME ||
  !process.env.DB_PORT
) {
  console.error('Database configuration env vars are missing');
  process.exit(1);
}

const sql = postgres({
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  db: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

async function insertApiKey() {
  try {
    const name = process.argv[2] || 'Developer API key';
    
    await sql`
      INSERT INTO api_keys (name, key, expires_at, updated_at)
      VALUES (${name}, ${process.env.API_KEY}, '2050-01-01', now())
      ON CONFLICT (name) DO NOTHING
    `;
    
    console.log('API key inserted successfully');
  } catch (error) {
    throw new Error('Failed to insert API key:', error);
  } finally {
    await sql.end();
  }
}

insertApiKey().catch(console.error);