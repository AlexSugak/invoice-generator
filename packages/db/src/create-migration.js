const fs = require('fs');
const path = require('path');

const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
const name = process.argv[2];

if (!name) {
  console.error('Please provide a migration name');
  process.exit(1);
}

const filename = `${timestamp}-${name}`;
const upFile = path.join(__dirname, 'migrations', `${filename}.sql`);
const downFile = path.join(__dirname, 'migrations', `${filename}.down.sql`);

fs.writeFileSync(upFile, '-- Up Migration');
fs.writeFileSync(downFile, '-- Down Migration');

console.log(`Created migration files:`);
console.log(upFile);
console.log(downFile);