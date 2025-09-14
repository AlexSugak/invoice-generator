import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Invoice Page', () => {
  test('should generate and download PDF', async ({ page }) => {
    // 1. Navigate to invoice page
    await page.goto('http://localhost:3000/invoice');

    // 2. Fill in the form with test data
    await page.fill('input[name="invoiceName"]', 'Invoice 123');
    await page.fill('input[name="invoiceNumber"]', '123');
    await page.fill('input[placeholder="Who is this to?"]', 'Client Name');
    await page.fill(
      'input[placeholder="Description of item/service..."]',
      'Test Service',
    );
    await page.fill('input[name="rate"]', '100');

    // 3. Set up download listener
    const downloadPromise = page.waitForEvent('download');

    // 4. Click generate button
    await page.click('button:has-text("Create Invoice PDF")');

    // 5. Wait for download to start
    const download = await downloadPromise;

    // 6. Verify download
    expect(download.suggestedFilename()).toMatch(
      /^invoice-\d{4}-\d{2}-\d{2}\.pdf$/,
    );

    // 7. Save file and verify it exists
    const downloadPath = path.join(
      __dirname,
      'downloads',
      download.suggestedFilename(),
    );
    await download.saveAs(downloadPath);

    // 8. Optional: Verify file size is non-zero
    const fs = require('fs');
    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(0);
  });
});
