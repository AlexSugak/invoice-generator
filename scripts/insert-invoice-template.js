const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

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

async function insertInvoiceTemplate() {
  try {
    const invoice = fs.readFileSync(path.join(__dirname, 'invoice.hbs'), { encoding: 'utf8', flag: 'r' })
    
    await sql`
      INSERT INTO templates (name, body, updated_at)
      VALUES ('invoice', ${invoice}, now())
      ON CONFLICT (name) DO UPDATE
      SET body = EXCLUDED.body,
      updated_at = EXCLUDED.updated_at
    `;
    
    console.log('Invoice template inserted successfully');
  } catch (error) {
    throw new Error('Failed to insert invoice template:' + error.message, error);
  } finally {
    await sql.end();
  }
}

insertInvoiceTemplate().catch(console.error);