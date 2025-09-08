import postgres from 'postgres';

if (
  !process.env.DB_USER ||
  !process.env.DB_PASSWORD ||
  !process.env.DB_HOST ||
  !process.env.DB_NAME ||
  !Number(process.env.DB_PORT)
) {
  throw new Error('DB_* env vars are missing');
}

const sql = postgres({
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  db: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

export default sql;
