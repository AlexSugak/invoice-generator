// scripts/run-with-env.js
const { spawn } = require('node:child_process');

const args = process.argv.slice(2); // pass-through to yarn
const child = spawn('yarn', args, {
  stdio: 'inherit',
  shell: process.platform === 'win32', // helps on Windows
});

child.on('exit', (code) => process.exit(code));