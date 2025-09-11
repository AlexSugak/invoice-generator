import { FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

async function globalSetup(config: FullConfig) {
  const downloadDir = path.join(__dirname, 'downloads');

  // Ensure downloads directory exists
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }

  // Clear previous downloads
  fs.readdirSync(downloadDir).forEach((file) => {
    fs.unlinkSync(path.join(downloadDir, file));
  });
}

export default globalSetup;
