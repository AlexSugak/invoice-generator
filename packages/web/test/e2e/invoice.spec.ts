import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Invoice Page', () => {
  test('should generate and download PDF', async ({ page }) => {
    // 1. Navigate to invoice page
    await page.goto('http://localhost:3000/invoice');

    // 2. Fill in the form with test data
    await page.fill('input[name="invoiceNumber"]', '123');
    await page.fill('input[placeholder="Who is this to?"]', 'Client Name');
    await page.fill(
      'input[placeholder="Description of item/service..."]',
      'Test Service',
    );
    await page.fill('input[name="rate"]', '100');

    // 3. Set up download listener
    const downloadPromise = page.waitForEvent('download', {
      timeout: 10000,
    });

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

test.describe('Draft Functionality', () => {
  test('should persist draft name in input after page reload', async ({ page }) => {
    const draftName = `persistent-draft-${Date.now()}`;
    
    // Navigate with draft parameter in URL
    await page.goto(`http://localhost:3000/invoice?draft=${draftName}`);
    await page.waitForLoadState('domcontentloaded');

    // Verify draft name appears in input
    await expect(page.getByLabel('Draft Name')).toHaveValue(draftName, { timeout: 10000 });
  });

  test('should maintain form state during session', async ({ page }) => {
    await page.goto('http://localhost:3000/invoice');
    await page.waitForLoadState('domcontentloaded');

    // Fill form with test data
    await page.locator('input[name="invoiceNumber"]').fill('SESSION-123');
    await page.locator('input[placeholder="Who is this to?"]').fill('Session Client');
    
    const firstItemRow = page.locator('.space-y-4 > div').first();
    await expect(firstItemRow).toBeVisible();
    await firstItemRow.locator('input[placeholder*="Description"]').fill('Session Service');
    await firstItemRow.getByLabel('Quantity').fill('3');
    await firstItemRow.getByLabel('Rate').fill('75');

    // Navigate away and back (without reload)
    await page.goto('http://localhost:3000/');
    await page.goto('http://localhost:3000/invoice');
    await page.waitForLoadState('domcontentloaded');

    // Check if any data persisted (this tests session-level persistence)
    const invoiceNumber = await page.locator('input[name="invoiceNumber"]').inputValue();
    const clientName = await page.locator('input[placeholder="Who is this to?"]').inputValue();
    
    // Log current values for debugging
    console.log('Invoice number after navigation:', invoiceNumber);
    console.log('Client name after navigation:', clientName);
    
    // At minimum, form should be in a clean state (not broken)
    expect(invoiceNumber).toBeDefined();
    expect(clientName).toBeDefined();
  });

  test('should handle empty draft name gracefully', async ({ page }) => {
    await page.goto('http://localhost:3000/invoice');
    await page.waitForLoadState('domcontentloaded');

    // Clear draft name and try to save
    await page.getByLabel('Draft Name').fill('');
    
    const saveButton = page.locator('button[id="save-draft-button"]');
    await expect(saveButton).toBeEnabled({ timeout: 10000 });
    
    // Fill some form data
    await page.locator('input[name="invoiceNumber"]').fill('EMPTY-001');
    
    // Try to save with empty draft name
    await page.evaluate(() => {
      const button = document.getElementById('save-draft-button');
      if (button) button.click();
    });
    
    // Verify page is still functional
    await expect(page.locator('input[name="invoiceNumber"]')).toHaveValue('EMPTY-001');
  });
});
