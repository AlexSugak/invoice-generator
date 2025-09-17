import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authFile = path.join(__dirname, 'auth.json');

async function globalSetup(config: FullConfig) {
  // Clear previous downloads
  const downloadDir = path.join(__dirname, 'downloads');
  if (fs.existsSync(downloadDir)) {
    fs.readdirSync(downloadDir).forEach((file) => {
      fs.unlinkSync(path.join(downloadDir, file));
    });
  } else {
    fs.mkdirSync(downloadDir, { recursive: true });
  }

  // Perform login
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/signin');
  await page.getByRole('button', { name: 'Login In' }).click();

  await page.waitForResponse(
    (response) =>
      response.url().includes('/api/auth/session') && response.status() === 200
  );

  // Wait for the main page to load after login
  // await page.waitForURL('http://localhost:3000/');

  // Save the authenticated state
  await page.context().storageState({ path: authFile });
  await browser.close();
}

export default globalSetup;
